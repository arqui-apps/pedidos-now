import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_schedule_day_of_week } from '@prisma/client';

export class ScheduleResponseDto {
  @ApiProperty({ example: 1 })
  business_schedule_id!: number;

  @ApiProperty({ example: 1 })
  business_id!: number;

  @ApiProperty({
    enum: business_schedule_day_of_week,
    example: business_schedule_day_of_week.monday,
  })
  day_of_week!: business_schedule_day_of_week;

  @ApiPropertyOptional({ example: '08:00:00', nullable: true })
  opening_time!: string | null;

  @ApiPropertyOptional({ example: '18:00:00', nullable: true })
  closing_time!: string | null;

  @ApiProperty({ example: true })
  is_open!: boolean;

  @ApiProperty({ example: '2026-03-21T22:00:00.000Z' })
  created_at!: Date;

  @ApiProperty({ example: '2026-03-21T22:00:00.000Z' })
  updated_at!: Date;
}
