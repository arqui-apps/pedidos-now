import {
  product_product_status,
  product_type_product_type_status,
} from '@prisma/client';

export interface ProductTypeSummarySnapshot {
  productTypeId: number;
  name: string;
  description: string | null;
  productTypeStatus: product_type_product_type_status | null;
}

export interface ProductStockSummarySnapshot {
  productStockId: number;
  availableQuantity: number;
  reservedQuantity: number;
  minimumAlertQuantity: number;
  lastUpdatedAt: Date;
}

export interface CatalogProductSnapshot {
  productId: number;
  name: string;
  description: string | null;
  internalCode: string | null;
  basePrice: number;
  imageUrl: string | null;
  productStatus: product_product_status;
  visibleInCatalog: boolean;
  stock: ProductStockSummarySnapshot | null;
}

export interface CatalogSectionSnapshot {
  productType: ProductTypeSummarySnapshot;
  products: CatalogProductSnapshot[];
}
