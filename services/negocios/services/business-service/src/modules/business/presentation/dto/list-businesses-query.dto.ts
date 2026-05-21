import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  business_business_status,
  business_business_type,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListBusinessesQueryDto {
  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  search?: string;

  @ApiPropertyOptional({
    enum: business_business_status,
    enumName: 'business_business_status',
  })
  @IsOptional()
  @IsEnum(business_business_status)
  businessStatus?: business_business_status;

  @ApiPropertyOptional({
    enum: business_business_type,
    enumName: 'business_business_type',
  })
  @IsOptional()
  @IsEnum(business_business_type)
  businessType?: business_business_type;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeDeleted?: boolean = false;
}
