import {
  business_schedule,
  business_schedule_day_of_week,
} from '@prisma/client';

export const SCHEDULES_REPOSITORY = 'SCHEDULES_REPOSITORY';

export interface CreateBusinessScheduleRepositoryInput {
  business_id: number;
  day_of_week: business_schedule_day_of_week;
  opening_time: Date | null;
  closing_time: Date | null;
  is_open: number;
}

export interface UpdateBusinessScheduleRepositoryInput {
  day_of_week?: business_schedule_day_of_week;
  opening_time?: Date | null;
  closing_time?: Date | null;
  is_open?: number;
}

export interface SchedulesRepository {
  businessExists(businessId: number): Promise<boolean>;
  findManyByBusinessId(businessId: number): Promise<business_schedule[]>;
  findByIdAndBusinessId(
    businessId: number,
    scheduleId: number,
  ): Promise<business_schedule | null>;
  findByBusinessIdAndDayOfWeek(
    businessId: number,
    dayOfWeek: business_schedule_day_of_week,
  ): Promise<business_schedule | null>;
  create(
    data: CreateBusinessScheduleRepositoryInput,
  ): Promise<business_schedule>;
  update(
    scheduleId: number,
    data: UpdateBusinessScheduleRepositoryInput,
  ): Promise<business_schedule>;
}
