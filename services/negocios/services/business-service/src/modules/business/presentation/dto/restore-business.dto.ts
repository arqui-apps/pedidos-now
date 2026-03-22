import { ApiPropertyOptional } from '@nestjs/swagger';
import { business_business_status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class RestoreBusinessDto {
  @ApiPropertyOptional({
    enum: business_business_status,
    enumName: 'business_business_status',
    default: business_business_status.active,
    description:
      'Status to assign after restore. Retired is intentionally rejected here.',
  })
  @IsOptional()
  @IsEnum(business_business_status)
  businessStatus?: business_business_status;
}
