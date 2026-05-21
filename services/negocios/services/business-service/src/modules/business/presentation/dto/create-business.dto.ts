import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  business_business_status,
  business_business_type,
} from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateBusinessDto {
  @ApiProperty({ maxLength: 150 })
  @IsString()
  @MaxLength(150)
  tradeName!: string;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @ApiProperty({
    enum: business_business_type,
    enumName: 'business_business_type',
  })
  @IsEnum(business_business_type)
  businessType!: business_business_type;

  @ApiPropertyOptional({
    enum: business_business_status,
    enumName: 'business_business_status',
    default: business_business_status.active,
  })
  @IsOptional()
  @IsEnum(business_business_status)
  businessStatus?: business_business_status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ maxLength: 30 })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  taxId?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logoPublicId?: string;
}
