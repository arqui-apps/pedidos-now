import { Injectable } from '@nestjs/common';
import { product_type, product_type_product_type_status } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';

type CreateProductTypeRepositoryInput = {
  business_id: number;
  name: string;
  description?: string | null;
  product_type_status?: product_type_product_type_status;
};

type UpdateProductTypeRepositoryInput = {
  name?: string;
  description?: string | null;
  product_type_status?: product_type_product_type_status;
};

@Injectable()
export class ProductTypesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async businessExists(businessId: number): Promise<boolean> {
    const business = await this.prisma.business.findUnique({
      where: { business_id: businessId },
      select: { business_id: true },
    });

    return Boolean(business);
  }

  async findManyByBusiness(businessId: number): Promise<product_type[]> {
    return this.prisma.product_type.findMany({
      where: {
        business_id: businessId,
        deleted_at: null,
      },
      orderBy: {
        product_type_id: 'asc',
      },
    });
  }

  async findActiveById(
    businessId: number,
    productTypeId: number,
  ): Promise<product_type | null> {
    return this.prisma.product_type.findFirst({
      where: {
        product_type_id: productTypeId,
        business_id: businessId,
        deleted_at: null,
      },
    });
  }

  async findAnyById(
    businessId: number,
    productTypeId: number,
  ): Promise<product_type | null> {
    return this.prisma.product_type.findFirst({
      where: {
        product_type_id: productTypeId,
        business_id: businessId,
      },
    });
  }

  async findByName(
    businessId: number,
    name: string,
  ): Promise<product_type | null> {
    return this.prisma.product_type.findFirst({
      where: {
        business_id: businessId,
        name,
      },
    });
  }

  async create(
    payload: CreateProductTypeRepositoryInput,
  ): Promise<product_type> {
    return this.prisma.product_type.create({
      data: {
        business_id: payload.business_id,
        name: payload.name,
        description: payload.description ?? null,
        product_type_status:
          payload.product_type_status ??
          product_type_product_type_status.active,
      },
    });
  }

  async update(
    productTypeId: number,
    payload: UpdateProductTypeRepositoryInput,
  ): Promise<product_type> {
    const data: {
      name?: string;
      description?: string | null;
      product_type_status?: product_type_product_type_status;
    } = {};

    if (payload.name !== undefined) {
      data.name = payload.name;
    }

    if (payload.description !== undefined) {
      data.description = payload.description;
    }

    if (payload.product_type_status !== undefined) {
      data.product_type_status = payload.product_type_status;
    }

    return this.prisma.product_type.update({
      where: { product_type_id: productTypeId },
      data,
    });
  }

  async softDelete(
    productTypeId: number,
    deletionReason?: string,
  ): Promise<product_type> {
    return this.prisma.product_type.update({
      where: { product_type_id: productTypeId },
      data: {
        deleted_at: new Date(),
        deletion_reason: deletionReason ?? null,
      },
    });
  }

  async restore(productTypeId: number): Promise<product_type> {
    return this.prisma.product_type.update({
      where: { product_type_id: productTypeId },
      data: {
        deleted_at: null,
        deletion_reason: null,
      },
    });
  }
}
