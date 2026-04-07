import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { product_product_status } from '@prisma/client';
import {
  ProductStockSummaryDto,
  ProductTypeSummaryDto,
} from './product-response.dto';

export class CatalogProductDto {
  @ApiProperty()
  productId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  internalCode!: string | null;

  @ApiProperty({ example: 19.9 })
  basePrice!: number;

  @ApiPropertyOptional({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty({
    enum: product_product_status,
    enumName: 'product_product_status',
  })
  productStatus!: product_product_status;

  @ApiProperty()
  visibleInCatalog!: boolean;

  @ApiPropertyOptional({ type: ProductStockSummaryDto, nullable: true })
  stock!: ProductStockSummaryDto | null;
}

export class CatalogSectionDto {
  @ApiProperty({ type: ProductTypeSummaryDto })
  productType!: ProductTypeSummaryDto;

  @ApiProperty({ type: CatalogProductDto, isArray: true })
  products!: CatalogProductDto[];
}

export class BusinessCatalogResponseDto {
  @ApiProperty()
  businessId!: number;

  @ApiProperty({ type: CatalogSectionDto, isArray: true })
  sections!: CatalogSectionDto[];
}
