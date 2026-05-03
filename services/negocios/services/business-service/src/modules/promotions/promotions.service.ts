import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePromotionRequestDto,
  PromotionDiscountType,
} from './dto/create-promotion-request.dto';
import {
  PromotionRequestExternalStatus,
  RespondPromotionRequestDto,
} from './dto/respond-promotion-request.dto';
import {
  LocalPromotionStatus,
  SyncPromotionReferenceDto,
} from './dto/sync-promotion-reference.dto';
import {
  PromotionScopeDto,
  PromotionScopeType,
} from './dto/promotion-scope.dto';

type DbValue = string | number | boolean | Date | null;
type DbRow = Record<string, unknown>;

interface CountRow {
  total: bigint | number;
}

interface ColumnRow {
  COLUMN_NAME: string;
}

interface PromotionRequestFilters {
  businessId?: string;
  status?: string;
}

interface PromotionReferenceFilters {
  businessId?: string;
  externalPromotionId?: string;
  status?: string;
}

interface PromotionSyncHistoryFilters {
  businessId?: string;
  externalPromotionId?: string;
}

@Injectable()
export class PromotionsService {
  private readonly requestTable = 'business_promotion_request';
  private readonly scopeTable = 'promotion_request_scope';
  private readonly referenceTable = 'business_promotion_reference';
  private readonly syncHistoryTable = 'promotion_sync_history';

  constructor(private readonly prisma: PrismaService) {}

  async createRequest(dto: CreatePromotionRequestDto): Promise<DbRow> {
    if (!dto.scopes?.length) {
      throw new BadRequestException(
        'Debe enviar al menos un alcance para la promoción.',
      );
    }

    await this.ensureTable(this.requestTable);
    await this.ensureTable(this.scopeTable);

    const insertedRequest = await this.insertDynamic(this.requestTable, {
      business_id: dto.businessId,
      business_type: dto.businessType ?? null,
      requested_name: dto.requestedName,
      requested_description: dto.requestedDescription ?? null,
      discount_type: dto.discountType,
      discount_value: dto.discountValue,
      requested_start_at: dto.requestedStartAt,
      requested_end_at: dto.requestedEndAt,
      requested_start_time: dto.requestedStartTime ?? null,
      requested_end_time: dto.requestedEndTime ?? null,
      current_order_count: dto.currentOrderCount ?? 0,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const requestId = this.getRowId(insertedRequest);

    for (const scope of dto.scopes) {
      await this.insertDynamic(this.scopeTable, {
        promotion_request_id: requestId,
        request_id: requestId,
        scope_type: scope.scopeType,
        target_reference_id: scope.targetReferenceId,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    await this.createSyncHistory({
      business_id: dto.businessId,
      external_promotion_id: null,
      action: 'promotion_request_created',
      status: 'success',
      payload: JSON.stringify(dto),
      error_message: null,
    });

    return this.findRequestById(requestId);
  }

  async findRequests(filters: PromotionRequestFilters): Promise<DbRow[]> {
    await this.ensureTable(this.requestTable);

    const where: string[] = [];
    const params: DbValue[] = [];

    if (filters.businessId) {
      where.push('business_id = ?');
      params.push(filters.businessId);
    }

    if (filters.status) {
      where.push('status = ?');
      params.push(filters.status);
    }

    const sql = `
      SELECT *
      FROM \`${this.requestTable}\`
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
    `;

    return this.prisma.$queryRawUnsafe<DbRow[]>(sql, ...params);
  }

  async findRequestById(id: string): Promise<DbRow> {
    await this.ensureTable(this.requestTable);

    const rows = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `SELECT * FROM \`${this.requestTable}\` WHERE id = ? LIMIT 1`,
      id,
    );

    const request = rows[0];

    if (!request) {
      throw new NotFoundException('Solicitud de promoción no encontrada.');
    }

    const scopes = await this.findScopesByRequestId(id);

    return {
      ...request,
      scopes,
    };
  }

  async respondRequest(
    id: string,
    dto: RespondPromotionRequestDto,
  ): Promise<DbRow> {
    await this.ensureTable(this.requestTable);
    await this.ensureTable(this.referenceTable);

    const current = await this.findRequestById(id);
    const currentBusinessId = this.toStringValue(
      current['business_id'] ?? current['businessId'],
    );

    await this.updateDynamic(this.requestTable, id, {
      status: dto.status,
      external_request_id: dto.externalRequestId,
      external_promotion_id: dto.externalPromotionId ?? null,
      rejection_reason: dto.rejectionReason ?? null,
      approved_start_at: dto.approvedStartAt ?? null,
      approved_end_at: dto.approvedEndAt ?? null,
      approved_start_time: dto.approvedStartTime ?? null,
      approved_end_time: dto.approvedEndTime ?? null,
      discount_type: dto.discountType ?? null,
      discount_value: dto.discountValue ?? null,
      responded_at: new Date(),
      updated_at: new Date(),
    });

    if (
      dto.status === PromotionRequestExternalStatus.APPROVED &&
      dto.externalPromotionId
    ) {
      const businessId = currentBusinessId;

      const approvedScopes = await this.resolveApprovedScopes(
        id,
        dto.approvedScopes,
      );

      for (const scope of approvedScopes) {
        await this.upsertReference({
          businessId,
          externalPromotionId: dto.externalPromotionId,
          externalRequestId: dto.externalRequestId,
          scopeType: scope.scopeType,
          targetReferenceId: scope.targetReferenceId,
          status: LocalPromotionStatus.ACTIVE,
          startsAt:
            dto.approvedStartAt ??
            this.toStringValue(current['requested_start_at']),
          endsAt:
            dto.approvedEndAt ??
            this.toStringValue(current['requested_end_at']),
          startTime:
            dto.approvedStartTime ??
            this.toOptionalStringValue(current['requested_start_time']),
          endTime:
            dto.approvedEndTime ??
            this.toOptionalStringValue(current['requested_end_time']),
          discountType:
            dto.discountType ?? this.toDiscountType(current['discount_type']),
          discountValue:
            dto.discountValue ?? this.toNumberValue(current['discount_value']),
        });
      }
    }

    await this.createSyncHistory({
      business_id: currentBusinessId,
      external_promotion_id: dto.externalPromotionId ?? null,
      action: `promotion_request_${dto.status}`,
      status: 'success',
      payload: JSON.stringify(dto),
      error_message: null,
    });

    return this.findRequestById(id);
  }

  async syncReference(dto: SyncPromotionReferenceDto): Promise<DbRow> {
    await this.ensureTable(this.referenceTable);

    const reference = await this.upsertReference(dto);

    await this.createSyncHistory({
      business_id: dto.businessId,
      external_promotion_id: dto.externalPromotionId,
      action: 'promotion_reference_synced',
      status: 'success',
      payload: JSON.stringify(dto),
      error_message: null,
    });

    return reference;
  }

  async findReferences(filters: PromotionReferenceFilters): Promise<DbRow[]> {
    await this.ensureTable(this.referenceTable);

    const where: string[] = [];
    const params: DbValue[] = [];

    if (filters.businessId) {
      where.push('business_id = ?');
      params.push(filters.businessId);
    }

    if (filters.externalPromotionId) {
      where.push('external_promotion_id = ?');
      params.push(filters.externalPromotionId);
    }

    if (filters.status) {
      where.push('status = ?');
      params.push(filters.status);
    }

    const sql = `
      SELECT *
      FROM \`${this.referenceTable}\`
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
    `;

    return this.prisma.$queryRawUnsafe<DbRow[]>(sql, ...params);
  }

  async findSyncHistory(
    filters: PromotionSyncHistoryFilters,
  ): Promise<DbRow[]> {
    await this.ensureTable(this.syncHistoryTable);

    const where: string[] = [];
    const params: DbValue[] = [];

    if (filters.businessId) {
      where.push('business_id = ?');
      params.push(filters.businessId);
    }

    if (filters.externalPromotionId) {
      where.push('external_promotion_id = ?');
      params.push(filters.externalPromotionId);
    }

    const sql = `
      SELECT *
      FROM \`${this.syncHistoryTable}\`
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
    `;

    return this.prisma.$queryRawUnsafe<DbRow[]>(sql, ...params);
  }

  private async resolveApprovedScopes(
    requestId: string,
    approvedScopes?: PromotionScopeDto[],
  ): Promise<PromotionScopeDto[]> {
    if (approvedScopes?.length) {
      return approvedScopes;
    }

    const rows = await this.findScopesByRequestId(requestId);

    return rows.map((row) => ({
      scopeType: this.toScopeType(row['scope_type'] ?? row['scopeType']),
      targetReferenceId: this.toStringValue(
        row['target_reference_id'] ?? row['targetReferenceId'],
      ),
    }));
  }

  private async upsertReference(
    dto: SyncPromotionReferenceDto,
  ): Promise<DbRow> {
    const existing = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT *
      FROM \`${this.referenceTable}\`
      WHERE external_promotion_id = ?
        AND business_id = ?
        AND scope_type = ?
        AND target_reference_id = ?
      LIMIT 1
      `,
      dto.externalPromotionId,
      dto.businessId,
      dto.scopeType,
      dto.targetReferenceId,
    );

    const data: Record<string, DbValue> = {
      business_id: dto.businessId,
      external_promotion_id: dto.externalPromotionId,
      external_request_id: dto.externalRequestId ?? null,
      scope_type: dto.scopeType,
      target_reference_id: dto.targetReferenceId,
      status: dto.status,
      starts_at: dto.startsAt,
      ends_at: dto.endsAt,
      start_time: dto.startTime ?? null,
      end_time: dto.endTime ?? null,
      discount_type: dto.discountType,
      discount_value: dto.discountValue,
      updated_at: new Date(),
    };

    const current = existing[0];

    if (current) {
      const id = this.getRowId(current);
      await this.updateDynamic(this.referenceTable, id, data);

      const updated = await this.prisma.$queryRawUnsafe<DbRow[]>(
        `SELECT * FROM \`${this.referenceTable}\` WHERE id = ? LIMIT 1`,
        id,
      );

      return this.firstOrThrow(
        updated,
        'Referencia de promoción no encontrada.',
      );
    }

    return this.insertDynamic(this.referenceTable, {
      ...data,
      created_at: new Date(),
    });
  }

  private async findScopesByRequestId(requestId: string): Promise<DbRow[]> {
    await this.ensureTable(this.scopeTable);

    return this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT *
      FROM \`${this.scopeTable}\`
      WHERE promotion_request_id = ?
         OR request_id = ?
      ORDER BY created_at ASC
      `,
      requestId,
      requestId,
    );
  }

  private async createSyncHistory(
    data: Record<string, DbValue>,
  ): Promise<DbRow | null> {
    try {
      await this.ensureTable(this.syncHistoryTable);

      return await this.insertDynamic(this.syncHistoryTable, {
        ...data,
        synced_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch {
      return null;
    }
  }

  private async ensureTable(tableName: string): Promise<void> {
    const rows = await this.prisma.$queryRawUnsafe<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
      `,
      tableName,
    );

    const total = Number(rows[0]?.total ?? 0);

    if (total <= 0) {
      throw new BadRequestException(
        `La tabla ${tableName} no existe en la base de datos.`,
      );
    }
  }

  private async getColumns(tableName: string): Promise<Set<string>> {
    const rows = await this.prisma.$queryRawUnsafe<ColumnRow[]>(
      `
      SELECT COLUMN_NAME
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
      `,
      tableName,
    );

    return new Set(rows.map((row: ColumnRow) => row.COLUMN_NAME));
  }

  private async insertDynamic(
    tableName: string,
    data: Record<string, DbValue>,
  ): Promise<DbRow> {
    const columns = await this.getColumns(tableName);
    const entries = Object.entries(data).filter(
      ([key, value]) => columns.has(key) && value !== undefined,
    );

    if (!entries.length) {
      throw new BadRequestException(
        `No hay columnas compatibles para insertar en ${tableName}.`,
      );
    }

    const columnSql = entries.map(([key]) => `\`${key}\``).join(', ');
    const placeholderSql = entries.map(() => '?').join(', ');
    const values = entries.map(([, value]) => value);

    await this.prisma.$executeRawUnsafe(
      `INSERT INTO \`${tableName}\` (${columnSql}) VALUES (${placeholderSql})`,
      ...values,
    );

    const rows = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `SELECT * FROM \`${tableName}\` ORDER BY created_at DESC LIMIT 1`,
    );

    return this.firstOrThrow(rows, `No se pudo insertar en ${tableName}.`);
  }

  private async updateDynamic(
    tableName: string,
    id: string,
    data: Record<string, DbValue>,
  ): Promise<void> {
    const columns = await this.getColumns(tableName);
    const entries = Object.entries(data).filter(
      ([key, value]) => columns.has(key) && value !== undefined,
    );

    if (!entries.length) {
      return;
    }

    const setSql = entries.map(([key]) => `\`${key}\` = ?`).join(', ');
    const values = entries.map(([, value]) => value);

    await this.prisma.$executeRawUnsafe(
      `UPDATE \`${tableName}\` SET ${setSql} WHERE id = ?`,
      ...values,
      id,
    );
  }

  private firstOrThrow(rows: DbRow[], message: string): DbRow {
    const row = rows[0];

    if (!row) {
      throw new BadRequestException(message);
    }

    return row;
  }

  private getRowId(row: DbRow): string {
    const id = row['id'] ?? row['ID'];

    return this.toStringValue(id, 'No se pudo obtener el id del registro.');
  }

  private toStringValue(value: unknown, errorMessage?: string): string {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'bigint'
    ) {
      return String(value);
    }

    throw new BadRequestException(
      errorMessage ?? 'El valor recibido no se puede convertir a texto.',
    );
  }

  private toOptionalStringValue(value: unknown): string | undefined {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }

    return this.toStringValue(value);
  }

  private toNumberValue(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return 0;
  }

  private toDiscountType(value: unknown): PromotionDiscountType {
    if (value === PromotionDiscountType.FIXED_AMOUNT) {
      return PromotionDiscountType.FIXED_AMOUNT;
    }

    return PromotionDiscountType.PERCENTAGE;
  }

  private toScopeType(value: unknown): PromotionScopeType {
    if (value === PromotionScopeType.BUSINESS) {
      return PromotionScopeType.BUSINESS;
    }

    if (value === PromotionScopeType.PRODUCT_TYPE) {
      return PromotionScopeType.PRODUCT_TYPE;
    }

    return PromotionScopeType.PRODUCT;
  }
}
