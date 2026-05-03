import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class MetricsRangeQueryDto {
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  @IsIn(['day', 'summary'])
  groupBy?: 'day' | 'summary';
}
