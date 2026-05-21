import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  business_schedule,
  business_schedule_day_of_week,
} from '@prisma/client';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { ScheduleResponseDto } from '../dto/schedule-response.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { ScheduleMapper } from '../mappers/schedule.mapper';
import { SCHEDULE_DAY_ORDER } from '../../domain/constants/schedule-day-order.constant';
import { SCHEDULES_REPOSITORY } from '../../domain/repositories/schedules.repository';
import type { SchedulesRepository } from '../../domain/repositories/schedules.repository';

interface NormalizedScheduleInput {
  day_of_week: business_schedule_day_of_week;
  opening_time: Date | null;
  closing_time: Date | null;
  is_open: number;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

@Injectable()
export class SchedulesService {
  constructor(
    @Inject(SCHEDULES_REPOSITORY)
    private readonly schedulesRepository: SchedulesRepository,
  ) {}

  async listByBusinessId(businessId: number): Promise<ScheduleResponseDto[]> {
    await this.ensureBusinessExists(businessId);

    const schedules =
      await this.schedulesRepository.findManyByBusinessId(businessId);

    return schedules
      .sort(
        (left, right) =>
          SCHEDULE_DAY_ORDER[left.day_of_week] -
          SCHEDULE_DAY_ORDER[right.day_of_week],
      )
      .map((schedule) => ScheduleMapper.toResponse(schedule));
  }

  async getById(
    businessId: number,
    scheduleId: number,
  ): Promise<ScheduleResponseDto> {
    await this.ensureBusinessExists(businessId);

    const schedule = await this.findScheduleOrThrow(businessId, scheduleId);

    return ScheduleMapper.toResponse(schedule);
  }

  async create(
    businessId: number,
    createScheduleDto: CreateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    await this.ensureBusinessExists(businessId);

    const duplicatedSchedule =
      await this.schedulesRepository.findByBusinessIdAndDayOfWeek(
        businessId,
        createScheduleDto.day_of_week,
      );

    if (duplicatedSchedule) {
      throw new ConflictException(
        `A schedule for ${createScheduleDto.day_of_week} already exists for business ${businessId}`,
      );
    }

    const normalizedInput = this.normalizeScheduleInput({
      day_of_week: createScheduleDto.day_of_week,
      is_open: createScheduleDto.is_open,
      opening_time: createScheduleDto.opening_time,
      closing_time: createScheduleDto.closing_time,
    });

    const schedule = await this.schedulesRepository.create({
      business_id: businessId,
      ...normalizedInput,
    });

    return ScheduleMapper.toResponse(schedule);
  }

  async update(
    businessId: number,
    scheduleId: number,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<ScheduleResponseDto> {
    await this.ensureBusinessExists(businessId);

    const existingSchedule = await this.findScheduleOrThrow(
      businessId,
      scheduleId,
    );

    const mergedInput = this.mergeScheduleInput(
      existingSchedule,
      updateScheduleDto,
    );

    const conflictingSchedule =
      await this.schedulesRepository.findByBusinessIdAndDayOfWeek(
        businessId,
        mergedInput.day_of_week,
      );

    if (
      conflictingSchedule &&
      conflictingSchedule.business_schedule_id !==
        existingSchedule.business_schedule_id
    ) {
      throw new ConflictException(
        `A schedule for ${mergedInput.day_of_week} already exists for business ${businessId}`,
      );
    }

    const updatedSchedule = await this.schedulesRepository.update(
      scheduleId,
      mergedInput,
    );

    return ScheduleMapper.toResponse(updatedSchedule);
  }

  private async ensureBusinessExists(businessId: number): Promise<void> {
    const businessExists =
      await this.schedulesRepository.businessExists(businessId);

    if (!businessExists) {
      throw new NotFoundException(`Business ${businessId} was not found`);
    }
  }

  private async findScheduleOrThrow(
    businessId: number,
    scheduleId: number,
  ): Promise<business_schedule> {
    const schedule = await this.schedulesRepository.findByIdAndBusinessId(
      businessId,
      scheduleId,
    );

    if (!schedule) {
      throw new NotFoundException(
        `Schedule ${scheduleId} was not found for business ${businessId}`,
      );
    }

    return schedule;
  }

  private mergeScheduleInput(
    existingSchedule: business_schedule,
    updateScheduleDto: UpdateScheduleDto,
  ): NormalizedScheduleInput {
    const currentOpeningTime = this.formatTime(existingSchedule.opening_time);
    const currentClosingTime = this.formatTime(existingSchedule.closing_time);

    return this.normalizeScheduleInput({
      day_of_week:
        updateScheduleDto.day_of_week ?? existingSchedule.day_of_week,
      is_open: updateScheduleDto.is_open ?? Boolean(existingSchedule.is_open),
      opening_time:
        updateScheduleDto.opening_time !== undefined
          ? updateScheduleDto.opening_time
          : currentOpeningTime,
      closing_time:
        updateScheduleDto.closing_time !== undefined
          ? updateScheduleDto.closing_time
          : currentClosingTime,
    });
  }

  private normalizeScheduleInput(input: {
    day_of_week: business_schedule_day_of_week;
    is_open: boolean;
    opening_time?: string;
    closing_time?: string;
  }): NormalizedScheduleInput {
    if (input.is_open) {
      if (!input.opening_time || !input.closing_time) {
        throw new BadRequestException(
          'opening_time and closing_time are required when is_open is true',
        );
      }

      this.validateTimeString(input.opening_time, 'opening_time');
      this.validateTimeString(input.closing_time, 'closing_time');

      const openingTime = this.parseTimeToDate(input.opening_time);
      const closingTime = this.parseTimeToDate(input.closing_time);

      if (openingTime.getTime() >= closingTime.getTime()) {
        throw new BadRequestException(
          'closing_time must be greater than opening_time',
        );
      }

      return {
        day_of_week: input.day_of_week,
        opening_time: openingTime,
        closing_time: closingTime,
        is_open: 1,
      };
    }

    if (input.opening_time || input.closing_time) {
      throw new BadRequestException(
        'opening_time and closing_time must be omitted when is_open is false',
      );
    }

    return {
      day_of_week: input.day_of_week,
      opening_time: null,
      closing_time: null,
      is_open: 0,
    };
  }

  private validateTimeString(value: string, fieldName: string): void {
    if (!TIME_PATTERN.test(value)) {
      throw new BadRequestException(
        `${fieldName} must use HH:mm or HH:mm:ss format`,
      );
    }
  }

  private parseTimeToDate(value: string): Date {
    const normalizedValue = value.length === 5 ? `${value}:00` : value;
    const [hours, minutes, seconds] = normalizedValue.split(':').map(Number);

    return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
  }

  private formatTime(value: Date | string | null): string | undefined {
    if (!value) {
      return undefined;
    }

    if (typeof value === 'string') {
      const maybeDate = new Date(value);

      if (!Number.isNaN(maybeDate.getTime())) {
        return this.dateToTimeString(maybeDate);
      }

      return value;
    }

    return this.dateToTimeString(value);
  }

  private dateToTimeString(value: Date): string {
    const hours = value.getUTCHours().toString().padStart(2, '0');
    const minutes = value.getUTCMinutes().toString().padStart(2, '0');
    const seconds = value.getUTCSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }
}
