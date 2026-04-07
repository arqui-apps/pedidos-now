import { ApiPropertyOptional } from '@nestjs/swagger';
import { product_product_status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class RestoreProductDto {
  @ApiPropertyOptional({
    enum: product_product_status,
    enumName: 'product_product_status',
    default: product_product_status.active,
    description: 'Status to assign after restoring the product.',
  })
  @IsOptional()
  @IsEnum(product_product_status)
  productStatus?: product_product_status;
}
