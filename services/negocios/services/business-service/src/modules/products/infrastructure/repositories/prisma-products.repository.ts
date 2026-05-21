import {
  Prisma,
  product_product_status,
  product_type_product_type_status,
} from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ListProductsQueryDto } from '../../presentation/dto/list-products-query.dto';

type PrismaProductsClient = Pick<
  Prisma.TransactionClient,
  'business' | 'product' | 'product_type' | 'product_stock'
>;

type ProductCreateData = Prisma.productUncheckedCreateInput;
type ProductUpdateData = Prisma.productUncheckedUpdateInput;

@Injectable()
export class PrismaProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async withTransaction<T>(
    callback: (client: PrismaProductsClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction((tx) =>
      callback(tx as PrismaProductsClient),
    );
  }

  async findBusinessById(
    businessId: number,
    includeDeleted = false,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.business.findFirst({
      where: {
        business_id: businessId,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });
  }

  async findProductTypeById(
    businessId: number,
    productTypeId: number,
    includeDeleted = false,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.product_type.findFirst({
      where: {
        product_type_id: productTypeId,
        business_id: businessId,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });
  }

  async findAll(
    businessId: number,
    query: ListProductsQueryDto,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.product.findMany({
      where: this.buildListWhere(businessId, query),
      include: this.buildProductInclude(),
      orderBy: [
        { product_type_id: 'asc' },
        { name: 'asc' },
        { product_id: 'asc' },
      ],
    });
  }

  async findById(
    businessId: number,
    productId: number,
    includeDeleted = false,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.product.findFirst({
      where: {
        product_id: productId,
        business_id: businessId,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
      include: this.buildProductInclude(),
    });
  }

  async create(
    data: ProductCreateData,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.product.create({
      data,
      include: this.buildProductInclude(),
    });
  }

  async createProductStock(
    data: Prisma.product_stockUncheckedCreateInput,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.product_stock.create({
      data,
    });
  }

  async update(
    productId: number,
    data: ProductUpdateData,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.product.update({
      where: { product_id: productId },
      data,
      include: this.buildProductInclude(),
    });
  }

  async findCatalog(
    businessId: number,
    client: PrismaProductsClient = this.prisma,
  ) {
    return client.product.findMany({
      where: {
        business_id: businessId,
        deleted_at: null,
        visible_in_catalog: 1,
        product_status: {
          in: [
            product_product_status.active,
            product_product_status.out_of_stock,
          ],
        },
        product_type: {
          is: {
            deleted_at: null,
            product_type_status: product_type_product_type_status.active,
          },
        },
      },
      include: this.buildProductInclude(),
      orderBy: [
        { product_type_id: 'asc' },
        { name: 'asc' },
        { product_id: 'asc' },
      ],
    });
  }

  private buildListWhere(businessId: number, query: ListProductsQueryDto) {
    return {
      business_id: businessId,
      ...(query.includeDeleted ? {} : { deleted_at: null }),
      ...(query.productStatus ? { product_status: query.productStatus } : {}),
      ...(query.productTypeId ? { product_type_id: query.productTypeId } : {}),
      ...(query.visibleInCatalog !== undefined
        ? { visible_in_catalog: query.visibleInCatalog ? 1 : 0 }
        : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { description: { contains: query.search } },
              { internal_code: { contains: query.search } },
            ],
          }
        : {}),
    };
  }

  private buildProductInclude() {
    return {
      product_type: true,
      product_stock: true,
    };
  }
}

export type ProductRecord = NonNullable<
  Awaited<ReturnType<PrismaProductsRepository['findById']>>
>;

export type CatalogProductRecord = Awaited<
  ReturnType<PrismaProductsRepository['findCatalog']>
>[number];
