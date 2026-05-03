import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RebuildMetricsDto } from './dto/rebuild-metrics.dto';

type DbValue = string | number | boolean | Date | null;
type DbRow = Record<string, unknown>;

interface CountRow {
  total: bigint | number;
}

interface ColumnRow {
  COLUMN_NAME: string;
}

export interface RebuildResponse {
  businessId: string;
  startDate: string;
  endDate: string;
  rebuiltDays: number;
  metrics: DbRow[];
}

@Injectable()
export class MetricsService {
  private readonly metricsTable = 'daily_business_metric';
  private readonly ordersTable = 'business_order';
  private readonly orderItemsTable = 'business_order_item';

  constructor(private readonly prisma: PrismaService) {}

  async getDailyMetric(businessId: string, date: string): Promise<DbRow> {
    await this.ensureTable(this.metricsTable);

    const rows = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT *
      FROM \`${this.metricsTable}\`
      WHERE business_id = ?
        AND metric_date = ?
      LIMIT 1
      `,
      businessId,
      date,
    );

    return (
      rows[0] ?? {
        business_id: businessId,
        metric_date: date,
        orders_count: 0,
        cancelled_orders_count: 0,
        products_sold_count: 0,
        subtotal_base: 0,
        discount_total: 0,
        service_fee_total: 0,
        tip_total: 0,
        total_paid: 0,
      }
    );
  }

  async getRangeMetrics(
    businessId: string,
    startDate: string,
    endDate: string,
  ): Promise<DbRow[]> {
    await this.ensureTable(this.metricsTable);
    this.validateDateRange(startDate, endDate);

    return this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT *
      FROM \`${this.metricsTable}\`
      WHERE business_id = ?
        AND metric_date BETWEEN ? AND ?
      ORDER BY metric_date ASC
      `,
      businessId,
      startDate,
      endDate,
    );
  }

  async getSummary(
    businessId: string,
    startDate: string,
    endDate: string,
  ): Promise<DbRow> {
    await this.ensureTable(this.metricsTable);
    this.validateDateRange(startDate, endDate);

    const rows = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT
        business_id,
        MIN(metric_date) AS start_date,
        MAX(metric_date) AS end_date,
        COALESCE(SUM(orders_count), 0) AS orders_count,
        COALESCE(SUM(cancelled_orders_count), 0) AS cancelled_orders_count,
        COALESCE(SUM(products_sold_count), 0) AS products_sold_count,
        COALESCE(SUM(subtotal_base), 0) AS subtotal_base,
        COALESCE(SUM(discount_total), 0) AS discount_total,
        COALESCE(SUM(service_fee_total), 0) AS service_fee_total,
        COALESCE(SUM(tip_total), 0) AS tip_total,
        COALESCE(SUM(total_paid), 0) AS total_paid
      FROM \`${this.metricsTable}\`
      WHERE business_id = ?
        AND metric_date BETWEEN ? AND ?
      GROUP BY business_id
      `,
      businessId,
      startDate,
      endDate,
    );

    return (
      rows[0] ?? {
        business_id: businessId,
        start_date: startDate,
        end_date: endDate,
        orders_count: 0,
        cancelled_orders_count: 0,
        products_sold_count: 0,
        subtotal_base: 0,
        discount_total: 0,
        service_fee_total: 0,
        tip_total: 0,
        total_paid: 0,
      }
    );
  }

  async rebuild(dto: RebuildMetricsDto): Promise<RebuildResponse> {
    await this.ensureTable(this.metricsTable);
    await this.ensureTable(this.ordersTable);
    this.validateDateRange(dto.startDate, dto.endDate);

    const dates = this.getDatesBetween(dto.startDate, dto.endDate);
    const rebuilt: DbRow[] = [];

    for (const date of dates) {
      const aggregate = await this.aggregateOrdersForDate(dto.businessId, date);
      const productsSoldCount = await this.aggregateProductsSoldForDate(
        dto.businessId,
        date,
      );

      const metricData: Record<string, DbValue> = {
        business_id: dto.businessId,
        metric_date: date,
        orders_count: this.toNumberValue(aggregate['orders_count']),
        cancelled_orders_count: this.toNumberValue(
          aggregate['cancelled_orders_count'],
        ),
        products_sold_count: productsSoldCount,
        subtotal_base: this.toNumberValue(aggregate['subtotal_base']),
        discount_total: this.toNumberValue(aggregate['discount_total']),
        service_fee_total: this.toNumberValue(aggregate['service_fee_total']),
        tip_total: this.toNumberValue(aggregate['tip_total']),
        total_paid: this.toNumberValue(aggregate['total_paid']),
        updated_at: new Date(),
      };

      const saved = await this.upsertMetric(metricData);
      rebuilt.push(saved);
    }

    return {
      businessId: dto.businessId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      rebuiltDays: rebuilt.length,
      metrics: rebuilt,
    };
  }

  private async aggregateOrdersForDate(
    businessId: string,
    date: string,
  ): Promise<DbRow> {
    const rows = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT
        COUNT(*) AS orders_count,
        COALESCE(SUM(CASE WHEN status LIKE 'CANCELLED%' THEN 1 ELSE 0 END), 0) AS cancelled_orders_count,
        COALESCE(SUM(subtotal_base), 0) AS subtotal_base,
        COALESCE(SUM(discount_total), 0) AS discount_total,
        COALESCE(SUM(service_fee), 0) AS service_fee_total,
        COALESCE(SUM(tip), 0) AS tip_total,
        COALESCE(SUM(total_paid), 0) AS total_paid
      FROM \`${this.ordersTable}\`
      WHERE business_id = ?
        AND DATE(COALESCE(confirmed_at, created_at)) = ?
      `,
      businessId,
      date,
    );

    return rows[0] ?? {};
  }

  private async aggregateProductsSoldForDate(
    businessId: string,
    date: string,
  ): Promise<number> {
    const hasItemsTable = await this.tableExists(this.orderItemsTable);

    if (!hasItemsTable) {
      return 0;
    }

    const rows = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT
        COALESCE(SUM(boi.quantity), 0) AS products_sold_count
      FROM \`${this.orderItemsTable}\` boi
      INNER JOIN \`${this.ordersTable}\` bo
        ON bo.id = boi.business_order_id
      WHERE bo.business_id = ?
        AND DATE(COALESCE(bo.confirmed_at, bo.created_at)) = ?
        AND bo.status NOT LIKE 'CANCELLED%'
      `,
      businessId,
      date,
    );

    return this.toNumberValue(rows[0]?.['products_sold_count']);
  }

  private async upsertMetric(data: Record<string, DbValue>): Promise<DbRow> {
    const existing = await this.prisma.$queryRawUnsafe<DbRow[]>(
      `
      SELECT *
      FROM \`${this.metricsTable}\`
      WHERE business_id = ?
        AND metric_date = ?
      LIMIT 1
      `,
      data['business_id'],
      data['metric_date'],
    );

    const current = existing[0];

    if (current) {
      const id = this.getRowId(current);

      await this.updateDynamic(this.metricsTable, id, data);

      const updated = await this.prisma.$queryRawUnsafe<DbRow[]>(
        `SELECT * FROM \`${this.metricsTable}\` WHERE id = ? LIMIT 1`,
        id,
      );

      return this.firstOrThrow(updated, 'Métrica diaria no encontrada.');
    }

    return this.insertDynamic(this.metricsTable, {
      ...data,
      created_at: new Date(),
    });
  }

  private validateDateRange(startDate: string, endDate: string): void {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('El rango de fechas no es válido.');
    }

    if (start > end) {
      throw new BadRequestException(
        'La fecha inicial no puede ser mayor que la fecha final.',
      );
    }
  }

  private getDatesBetween(startDate: string, endDate: string): string[] {
    const dates: string[] = [];
    const current = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);

    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    return dates;
  }

  private async ensureTable(tableName: string): Promise<void> {
    const exists = await this.tableExists(tableName);

    if (!exists) {
      throw new BadRequestException(
        `La tabla ${tableName} no existe en la base de datos.`,
      );
    }
  }

  private async tableExists(tableName: string): Promise<boolean> {
    const rows = await this.prisma.$queryRawUnsafe<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
      `,
      tableName,
    );

    return Number(rows[0]?.total ?? 0) > 0;
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

    if (
      typeof id === 'string' ||
      typeof id === 'number' ||
      typeof id === 'bigint'
    ) {
      return String(id);
    }

    throw new BadRequestException('No se pudo obtener el id del registro.');
  }

  private toNumberValue(value: unknown): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'bigint') {
      return Number(value);
    }

    if (typeof value === 'string') {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return 0;
  }
}
