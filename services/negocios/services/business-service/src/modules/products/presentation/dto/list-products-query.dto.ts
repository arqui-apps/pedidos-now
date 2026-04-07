import { ApiPropertyOptional } from '@nestjs/swagger';
import { product_product_status } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ListProductsQueryDto {
  @ApiPropertyOptional({ maxLength: 180 })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;

  @ApiPropertyOptional({
    enum: product_product_status,
    enumName: 'product_product_status',
  })
  @IsOptional()
  @IsEnum(product_product_status)
  productStatus?: product_product_status;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productTypeId?: number;

  @ApiPropertyOptional({
    description: 'Filter by visible_in_catalog using boolean semantics.',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  visibleInCatalog?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeDeleted?: boolean = false;
}
