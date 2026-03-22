import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_schedule_day_of_week } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

function transformBoolean(value: unknown): unknown {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}

export class CreateScheduleDto {
  @ApiProperty({
    enum: business_schedule_day_of_week,
    example: business_schedule_day_of_week.monday,
    description: 'Business day of week.',
  })
  @IsEnum(business_schedule_day_of_week)
  day_of_week!: business_schedule_day_of_week;

  @ApiProperty({
    example: true,
    description: 'Whether the business is open on the selected day.',
  })
  @Transform(({ value }) => transformBoolean(value))
  @IsBoolean()
  is_open!: boolean;

  @ApiPropertyOptional({
    example: '08:00:00',
    description:
      'Opening time in HH:mm:ss format. Required when is_open is true.',
  })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'opening_time must use HH:mm or HH:mm:ss format',
  })
  opening_time?: string;

  @ApiPropertyOptional({
    example: '18:00:00',
    description:
      'Closing time in HH:mm:ss format. Required when is_open is true.',
  })
  @IsOptional()
  @IsString()
  @Matches(TIME_PATTERN, {
    message: 'closing_time must use HH:mm or HH:mm:ss format',
  })
  closing_time?: string;
}
