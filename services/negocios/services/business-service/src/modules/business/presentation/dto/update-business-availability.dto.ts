import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_business_status } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateBusinessAvailabilityDto {
  @ApiProperty({
    enum: business_business_status,
    enumName: 'business_business_status',
    description:
      'Use active, temporarily_closed, suspended or inactive. Retired is handled by the retire endpoint.',
  })
  @IsEnum(business_business_status)
  businessStatus!: business_business_status;

  @ApiPropertyOptional({
    description:
      'Optional closure start when the business is being temporarily closed.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  closureStartAt?: string;

  @ApiPropertyOptional({
    description:
      'Optional closure end when the business is being temporarily closed.',
    format: 'date-time',
  })
  @IsOptional()
  @IsDateString()
  closureEndAt?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  closureReason?: string;

  @ApiPropertyOptional({
    default: false,
    description:
      'When true, existing active temporary closures are deactivated during the update.',
  })
  @IsOptional()
  @IsBoolean()
  clearActiveTemporaryClosures?: boolean;
}
