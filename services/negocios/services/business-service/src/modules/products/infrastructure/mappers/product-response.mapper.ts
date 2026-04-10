import {
  CatalogSectionSnapshot,
  ProductStockSummarySnapshot,
  ProductTypeSummarySnapshot,
} from '../../domain/product.types';
import { BusinessCatalogResponseDto } from '../../presentation/dto/business-catalog-response.dto';
import { ProductResponseDto } from '../../presentation/dto/product-response.dto';
import {
  CatalogProductRecord,
  ProductRecord,
} from '../repositories/prisma-products.repository';

function mapProductTypeSummary(
  record: ProductRecord,
): ProductTypeSummarySnapshot {
  return {
    productTypeId: record.product_type.product_type_id,
    name: record.product_type.name,
    description: record.product_type.description,
    productTypeStatus: record.product_type.product_type_status,
  };
}

function mapProductStockSummary(
  record: ProductRecord,
): ProductStockSummarySnapshot | null {
  if (!record.product_stock) {
    return null;
  }

  return {
    productStockId: record.product_stock.product_stock_id,
    availableQuantity: record.product_stock.available_quantity,
    reservedQuantity: record.product_stock.reserved_quantity,
    minimumAlertQuantity: record.product_stock.minimum_alert_quantity,
    lastUpdatedAt: record.product_stock.last_updated_at,
  };
}

export function mapProductToResponseDto(
  record: ProductRecord,
): ProductResponseDto {
  return {
    productId: record.product_id,
    businessId: record.business_id,
    productTypeId: record.product_type_id,
    name: record.name,
    description: record.description,
    internalCode: record.internal_code,
    basePrice: Number(record.base_price),
    imageUrl: record.image_url,
    imagePublicId: record.image_public_id,
    productStatus: record.product_status,
    visibleInCatalog: record.visible_in_catalog === 1,
    deletedAt: record.deleted_at,
    deletionReason: record.deletion_reason,
    productType: mapProductTypeSummary(record),
    stock: mapProductStockSummary(record),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapProductsToCatalogResponseDto(
  businessId: number,
  records: CatalogProductRecord[],
): BusinessCatalogResponseDto {
  const sectionsMap = new Map<number, CatalogSectionSnapshot>();

  for (const record of records) {
    const productTypeId = record.product_type.product_type_id;

    if (!sectionsMap.has(productTypeId)) {
      sectionsMap.set(productTypeId, {
        productType: mapProductTypeSummary(record),
        products: [],
      });
    }

    sectionsMap.get(productTypeId)?.products.push({
      productId: record.product_id,
      name: record.name,
      description: record.description,
      internalCode: record.internal_code,
      basePrice: Number(record.base_price),
      imageUrl: record.image_url,
      productStatus: record.product_status,
      visibleInCatalog: record.visible_in_catalog === 1,
      stock: mapProductStockSummary(record),
    });
  }

  return {
    businessId,
    sections: Array.from(sectionsMap.values()),
  };
}
