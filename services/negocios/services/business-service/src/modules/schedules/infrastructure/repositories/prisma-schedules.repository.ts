import { Injectable } from '@nestjs/common';
import {
  business_schedule,
  business_schedule_day_of_week,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CreateBusinessScheduleRepositoryInput,
  SchedulesRepository,
  UpdateBusinessScheduleRepositoryInput,
} from '../../domain/repositories/schedules.repository';

@Injectable()
export class PrismaSchedulesRepository implements SchedulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async businessExists(businessId: number): Promise<boolean> {
    const business = await this.prisma.business.findFirst({
      where: {
        business_id: businessId,
        deleted_at: null,
      },
      select: {
        business_id: true,
      },
    });

    return Boolean(business);
  }

  async findManyByBusinessId(businessId: number): Promise<business_schedule[]> {
    return this.prisma.business_schedule.findMany({
      where: {
        business_id: businessId,
      },
    });
  }

  async findByIdAndBusinessId(
    businessId: number,
    scheduleId: number,
  ): Promise<business_schedule | null> {
    return this.prisma.business_schedule.findFirst({
      where: {
        business_id: businessId,
        business_schedule_id: scheduleId,
      },
    });
  }

  async findByBusinessIdAndDayOfWeek(
    businessId: number,
    dayOfWeek: business_schedule_day_of_week,
  ): Promise<business_schedule | null> {
    return this.prisma.business_schedule.findFirst({
      where: {
        business_id: businessId,
        day_of_week: dayOfWeek,
      },
    });
  }

  async create(
    data: CreateBusinessScheduleRepositoryInput,
  ): Promise<business_schedule> {
    return this.prisma.business_schedule.create({
      data: {
        business_id: data.business_id,
        day_of_week: data.day_of_week,
        opening_time: data.opening_time,
        closing_time: data.closing_time,
        is_open: data.is_open,
      },
    });
  }

  async update(
    scheduleId: number,
    data: UpdateBusinessScheduleRepositoryInput,
  ): Promise<business_schedule> {
    const prismaData: Prisma.business_scheduleUpdateInput = {};

    if (data.day_of_week !== undefined) {
      prismaData.day_of_week = data.day_of_week;
    }

    if (data.opening_time !== undefined) {
      prismaData.opening_time = data.opening_time;
    }

    if (data.closing_time !== undefined) {
      prismaData.closing_time = data.closing_time;
    }

    if (data.is_open !== undefined) {
      prismaData.is_open = data.is_open;
    }

    return this.prisma.business_schedule.update({
      where: {
        business_schedule_id: scheduleId,
      },
      data: prismaData,
    });
  }
}
