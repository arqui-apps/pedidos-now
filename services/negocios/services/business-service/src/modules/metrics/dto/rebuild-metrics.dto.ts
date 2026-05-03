import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class RebuildMetricsDto {
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
