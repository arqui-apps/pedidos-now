import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { product_type_product_type_status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductTypeDto {
  @ApiProperty({
    example: 'Bebidas',
    maxLength: 120,
    description: 'Nombre del tipo de producto',
  })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: 'Productos líquidos para venta',
    description: 'Descripción opcional del tipo de producto',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: product_type_product_type_status,
    example: product_type_product_type_status.active,
    description: 'Estado del tipo de producto',
  })
  @IsOptional()
  @IsEnum(product_type_product_type_status)
  product_type_status?: product_type_product_type_status;
}
