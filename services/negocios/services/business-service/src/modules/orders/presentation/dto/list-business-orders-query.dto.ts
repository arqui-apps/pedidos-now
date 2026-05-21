import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { business_order_order_status } from '@prisma/client';

export class ListBusinessOrdersQueryDto {
  @ApiPropertyOptional({
    enum: business_order_order_status,
    enumName: 'business_order_order_status',
  })
  @IsOptional()
  @IsEnum(business_order_order_status)
  orderStatus?: business_order_order_status;

  @ApiPropertyOptional({ example: 99 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  externalCustomerId?: number;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  search?: string;
}
