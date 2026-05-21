import { business_schedule } from '@prisma/client';
import { ScheduleResponseDto } from '../dto/schedule-response.dto';

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

function formatTime(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    const maybeDate = new Date(value);

    if (!Number.isNaN(maybeDate.getTime())) {
      return `${pad(maybeDate.getUTCHours())}:${pad(maybeDate.getUTCMinutes())}:${pad(maybeDate.getUTCSeconds())}`;
    }

    return value;
  }

  return `${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`;
}

export class ScheduleMapper {
  static toResponse(schedule: business_schedule): ScheduleResponseDto {
    return {
      business_schedule_id: schedule.business_schedule_id,
      business_id: schedule.business_id,
      day_of_week: schedule.day_of_week,
      opening_time: formatTime(schedule.opening_time),
      closing_time: formatTime(schedule.closing_time),
      is_open: Boolean(schedule.is_open),
      created_at: schedule.created_at,
      updated_at: schedule.updated_at,
    };
  }
}
