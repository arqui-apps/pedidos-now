import { ApiPropertyOptional } from '@nestjs/swagger';
import { product_type_product_type_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProductTypeDto {
  @ApiPropertyOptional({
    example: 'Snacks',
    maxLength: 120,
    description: 'Nuevo nombre del tipo de producto',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    example: 'Productos empacados',
    description: 'Nueva descripción',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: product_type_product_type_status,
    example: product_type_product_type_status.inactive,
    description: 'Nuevo estado del tipo de producto',
  })
  @IsOptional()
  @IsEnum(product_type_product_type_status)
  product_type_status?: product_type_product_type_status;
}
