import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { product_product_status } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ maxLength: 180 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ maxLength: 60 })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  internalCode?: string;

  @ApiProperty({ example: 25.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    enum: product_product_status,
    enumName: 'product_product_status',
    default: product_product_status.active,
  })
  @IsOptional()
  @IsEnum(product_product_status)
  productStatus?: product_product_status;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  visibleInCatalog?: boolean;

  @ApiProperty({
    description: 'Existing product_type_id that belongs to the same business.',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  productTypeId!: number;
}
