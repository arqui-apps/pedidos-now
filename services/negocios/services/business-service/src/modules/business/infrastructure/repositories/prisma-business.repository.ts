import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ListBusinessesQueryDto } from '../../presentation/dto/list-businesses-query.dto';

type PrismaBusinessClient = Pick<
  Prisma.TransactionClient,
  'business' | 'temporary_business_closure'
>;

type BusinessCreateData = Prisma.businessCreateInput;
type BusinessUpdateData = Prisma.businessUpdateInput;
type TemporaryBusinessClosureCreateData =
  Prisma.temporary_business_closureUncheckedCreateInput;

@Injectable()
export class PrismaBusinessRepository {
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(
    callback: (client: PrismaBusinessClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((tx) =>
      callback(tx as PrismaBusinessClient),
    );
  }

  async findAll(query: ListBusinessesQueryDto, now = new Date()) {
    return this.prisma.business.findMany({
      where: this.buildListWhere(query),
      include: this.buildAvailabilityInclude(now),
      orderBy: [{ trade_name: 'asc' }, { business_id: 'asc' }],
    });
  }

  async findById(
    businessId: number,
    includeDeleted = false,
    now = new Date(),
    client: PrismaBusinessClient = this.prisma,
  ) {
    return client.business.findFirst({
      where: {
        business_id: businessId,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
      include: this.buildAvailabilityInclude(now),
    });
  }

  async create(
    data: BusinessCreateData,
    client: PrismaBusinessClient = this.prisma,
  ) {
    return client.business.create({
      data,
      include: this.buildAvailabilityInclude(new Date()),
    });
  }

  async update(
    businessId: number,
    data: BusinessUpdateData,
    client: PrismaBusinessClient = this.prisma,
  ) {
    return client.business.update({
      where: { business_id: businessId },
      data,
      include: this.buildAvailabilityInclude(new Date()),
    });
  }

  async createTemporaryClosure(
    data: TemporaryBusinessClosureCreateData,
    client: PrismaBusinessClient = this.prisma,
  ) {
    return client.temporary_business_closure.create({ data });
  }

  async deactivateActiveTemporaryClosures(
    businessId: number,
    client: PrismaBusinessClient = this.prisma,
  ) {
    return client.temporary_business_closure.updateMany({
      where: {
        business_id: businessId,
        is_active: 1,
      },
      data: {
        is_active: 0,
        updated_at: new Date(),
      },
    });
  }

  private buildListWhere(query: ListBusinessesQueryDto) {
    return {
      ...(query.includeDeleted ? {} : { deleted_at: null }),
      ...(query.businessStatus
        ? { business_status: query.businessStatus }
        : {}),
      ...(query.businessType ? { business_type: query.businessType } : {}),
      ...(query.search
        ? {
            OR: [
              { trade_name: { contains: query.search } },
              { legal_name: { contains: query.search } },
              { email: { contains: query.search } },
              { tax_id: { contains: query.search } },
            ],
          }
        : {}),
    };
  }

  private buildAvailabilityInclude(now: Date) {
    return {
      temporary_business_closure: {
        where: {
          is_active: 1,
          start_at: { lte: now },
          end_at: { gte: now },
        },
        orderBy: {
          start_at: 'asc' as const,
        },
        take: 1,
      },
    };
  }
}

export type BusinessRecord = NonNullable<
  Awaited<ReturnType<PrismaBusinessRepository['findById']>>
>;
