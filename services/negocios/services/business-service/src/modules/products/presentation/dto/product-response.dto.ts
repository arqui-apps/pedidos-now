import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  product_product_status,
  product_type_product_type_status,
} from '@prisma/client';

export class ProductTypeSummaryDto {
  @ApiProperty()
  productTypeId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty({
    enum: product_type_product_type_status,
    enumName: 'product_type_product_type_status',
    required: false,
    nullable: true,
  })
  productTypeStatus?: product_type_product_type_status | null;
}

export class ProductStockSummaryDto {
  @ApiProperty()
  productStockId!: number;

  @ApiProperty()
  availableQuantity!: number;

  @ApiProperty()
  reservedQuantity!: number;

  @ApiProperty()
  minimumAlertQuantity!: number;

  @ApiProperty()
  lastUpdatedAt!: Date;
}

export class ProductResponseDto {
  @ApiProperty()
  productId!: number;

  @ApiProperty()
  businessId!: number;

  @ApiProperty()
  productTypeId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  internalCode!: string | null;

  @ApiProperty({ example: 25.5 })
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

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  deletionReason!: string | null;

  @ApiProperty({ type: ProductTypeSummaryDto })
  productType!: ProductTypeSummaryDto;

  @ApiPropertyOptional({ type: ProductStockSummaryDto, nullable: true })
  stock!: ProductStockSummaryDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
  @ApiPropertyOptional({ nullable: true })
  imagePublicId!: string | null;
}
