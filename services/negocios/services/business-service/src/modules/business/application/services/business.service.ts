import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, business_business_status } from '@prisma/client';
import { PrismaBusinessRepository } from '../../infrastructure/repositories/prisma-business.repository';
import { mapBusinessToResponseDto } from '../../infrastructure/mappers/business-response.mapper';
import { BusinessResponseDto } from '../../presentation/dto/business-response.dto';
import { CreateBusinessDto } from '../../presentation/dto/create-business.dto';
import { ListBusinessesQueryDto } from '../../presentation/dto/list-businesses-query.dto';
import { RestoreBusinessDto } from '../../presentation/dto/restore-business.dto';
import { RetireBusinessDto } from '../../presentation/dto/retire-business.dto';
import { UpdateBusinessAvailabilityDto } from '../../presentation/dto/update-business-availability.dto';
import { UpdateBusinessDto } from '../../presentation/dto/update-business.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly businessRepository: PrismaBusinessRepository) {}

  async list(query: ListBusinessesQueryDto): Promise<BusinessResponseDto[]> {
    const records = await this.businessRepository.findAll(query);
    return records.map((record) => mapBusinessToResponseDto(record));
  }

  async getById(
    businessId: number,
    includeDeleted = false,
  ): Promise<BusinessResponseDto> {
    const record = await this.businessRepository.findById(
      businessId,
      includeDeleted,
    );

    if (!record) {
      throw new NotFoundException(`Business ${businessId} was not found.`);
    }

    return mapBusinessToResponseDto(record);
  }

  async create(dto: CreateBusinessDto): Promise<BusinessResponseDto> {
    try {
      const record = await this.businessRepository.create({
        trade_name: dto.tradeName,
        legal_name: dto.legalName,
        business_type: dto.businessType,
        business_status: dto.businessStatus ?? business_business_status.active,
        description: dto.description,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        tax_id: dto.taxId,
      });

      return mapBusinessToResponseDto(record);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async update(
    businessId: number,
    dto: UpdateBusinessDto,
  ): Promise<BusinessResponseDto> {
    await this.ensureBusinessExists(businessId);

    try {
      const record = await this.businessRepository.update(businessId, {
        ...(dto.tradeName !== undefined ? { trade_name: dto.tradeName } : {}),
        ...(dto.legalName !== undefined ? { legal_name: dto.legalName } : {}),
        ...(dto.businessType !== undefined
          ? { business_type: dto.businessType }
          : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.address !== undefined ? { address: dto.address } : {}),
        ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
        ...(dto.email !== undefined ? { email: dto.email } : {}),
        ...(dto.taxId !== undefined ? { tax_id: dto.taxId } : {}),
        updated_at: new Date(),
      });

      return mapBusinessToResponseDto(record);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async retire(
    businessId: number,
    dto: RetireBusinessDto,
  ): Promise<BusinessResponseDto> {
    const existing = await this.ensureBusinessExists(businessId);

    if (existing.deleted_at) {
      throw new BadRequestException(
        'Deleted businesses cannot be retired. Restore it first if needed.',
      );
    }

    if (existing.business_status === business_business_status.retired) {
      throw new BadRequestException(
        `Business ${businessId} is already retired.`,
      );
    }

    const record = await this.businessRepository.update(businessId, {
      business_status: business_business_status.retired,
      retired_at: new Date(),
      retirement_reason: dto.retirementReason,
      updated_at: new Date(),
    });

    return mapBusinessToResponseDto(record);
  }

  async restore(
    businessId: number,
    dto?: RestoreBusinessDto,
  ): Promise<BusinessResponseDto> {
    const restoredStatus =
      dto?.businessStatus ?? business_business_status.active;

    if (restoredStatus === business_business_status.retired) {
      throw new BadRequestException(
        'Restore cannot assign retired status. Use active, temporarily_closed, suspended or inactive.',
      );
    }

    await this.ensureBusinessExists(businessId, true);

    const record = await this.businessRepository.update(businessId, {
      business_status: restoredStatus,
      retired_at: null,
      retirement_reason: null,
      deleted_at: null,
      deletion_reason: null,
      updated_at: new Date(),
    });

    return mapBusinessToResponseDto(record);
  }

  async updateAvailability(
    businessId: number,
    dto: UpdateBusinessAvailabilityDto,
  ): Promise<BusinessResponseDto> {
    if (dto.businessStatus === business_business_status.retired) {
      throw new BadRequestException(
        'Use the retire endpoint to move a business to retired.',
      );
    }

    const existing = await this.ensureBusinessExists(businessId);

    if (existing.business_status === business_business_status.retired) {
      throw new BadRequestException(
        'A retired business must be restored before changing availability.',
      );
    }

    const closureStartAt = dto.closureStartAt
      ? new Date(dto.closureStartAt)
      : null;
    const closureEndAt = dto.closureEndAt ? new Date(dto.closureEndAt) : null;

    if (
      (closureStartAt && !closureEndAt) ||
      (!closureStartAt && closureEndAt)
    ) {
      throw new BadRequestException(
        'closureStartAt and closureEndAt must be sent together.',
      );
    }

    if (closureStartAt && closureEndAt && closureStartAt >= closureEndAt) {
      throw new BadRequestException(
        'closureEndAt must be greater than closureStartAt.',
      );
    }

    return this.businessRepository.withTransaction(async (client) => {
      const shouldClearClosures =
        dto.clearActiveTemporaryClosures === true ||
        dto.businessStatus !== business_business_status.temporarily_closed;

      if (shouldClearClosures) {
        await this.businessRepository.deactivateActiveTemporaryClosures(
          businessId,
          client,
        );
      }

      if (
        dto.businessStatus === business_business_status.temporarily_closed &&
        closureStartAt &&
        closureEndAt
      ) {
        await this.businessRepository.createTemporaryClosure(
          {
            business_id: businessId,
            start_at: closureStartAt,
            end_at: closureEndAt,
            reason: dto.closureReason,
            is_active: 1,
          },
          client,
        );
      }

      const updated = await this.businessRepository.update(
        businessId,
        {
          business_status: dto.businessStatus,
          updated_at: new Date(),
        },
        client,
      );

      return mapBusinessToResponseDto(updated);
    });
  }

  private async ensureBusinessExists(
    businessId: number,
    includeDeleted = false,
  ) {
    const business = await this.businessRepository.findById(
      businessId,
      includeDeleted,
    );

    if (!business) {
      throw new NotFoundException(`Business ${businessId} was not found.`);
    }

    return business;
  }

  private handlePrismaWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        `Unique constraint violation on ${this.formatPrismaUniqueTarget(
          error.meta?.target,
        )}.`,
      );
    }

    throw error;
  }

  private formatPrismaUniqueTarget(target: unknown): string {
    if (typeof target === 'string' && target.trim().length > 0) {
      return target;
    }

    if (Array.isArray(target)) {
      const fields = target.filter(
        (item): item is string => typeof item === 'string',
      );

      if (fields.length > 0) {
        return fields.join(', ');
      }
    }

    return 'unique field';
  }
}
