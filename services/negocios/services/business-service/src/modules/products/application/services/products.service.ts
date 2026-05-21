import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, product_product_status } from '@prisma/client';
import {
  mapProductToResponseDto,
  mapProductsToCatalogResponseDto,
} from '../../infrastructure/mappers/product-response.mapper';
import { PrismaProductsRepository } from '../../infrastructure/repositories/prisma-products.repository';
import { BusinessCatalogResponseDto } from '../../presentation/dto/business-catalog-response.dto';
import { CreateProductDto } from '../../presentation/dto/create-product.dto';
import { DeleteProductDto } from '../../presentation/dto/delete-product.dto';
import { ListProductsQueryDto } from '../../presentation/dto/list-products-query.dto';
import { ProductResponseDto } from '../../presentation/dto/product-response.dto';
import { RestoreProductDto } from '../../presentation/dto/restore-product.dto';
import { UpdateProductDto } from '../../presentation/dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly productsRepository: PrismaProductsRepository) {}

  async list(
    businessId: number,
    query: ListProductsQueryDto,
  ): Promise<ProductResponseDto[]> {
    await this.ensureBusinessExists(businessId);

    const records = await this.productsRepository.findAll(businessId, query);
    return records.map((record) => mapProductToResponseDto(record));
  }

  async getById(
    businessId: number,
    productId: number,
    includeDeleted = false,
  ): Promise<ProductResponseDto> {
    await this.ensureBusinessExists(businessId);

    const record = await this.productsRepository.findById(
      businessId,
      productId,
      includeDeleted,
    );

    if (!record) {
      throw new NotFoundException(
        `Product ${productId} was not found for business ${businessId}.`,
      );
    }

    return mapProductToResponseDto(record);
  }

  async create(
    businessId: number,
    dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    await this.ensureBusinessExists(businessId);
    await this.ensureProductTypeExists(businessId, dto.productTypeId);

    try {
      const record = await this.productsRepository.withTransaction(
        async (tx) => {
          const createdProduct = await this.productsRepository.create(
            {
              business_id: businessId,
              product_type_id: dto.productTypeId,
              name: dto.name,
              description: dto.description,
              internal_code: dto.internalCode,
              base_price: dto.basePrice,
              image_url: dto.imageUrl,
              image_public_id: dto.imagePublicId,
              product_status:
                dto.productStatus ?? product_product_status.active,
              visible_in_catalog: dto.visibleInCatalog === false ? 0 : 1,
            },
            tx,
          );

          await this.productsRepository.createProductStock(
            {
              product_id: createdProduct.product_id,
              available_quantity: 0,
              reserved_quantity: 0,
              minimum_alert_quantity: 0,
            },
            tx,
          );

          const hydratedProduct = await this.productsRepository.findById(
            businessId,
            createdProduct.product_id,
            true,
            tx,
          );

          if (!hydratedProduct) {
            throw new NotFoundException(
              `Product ${createdProduct.product_id} was created but could not be reloaded.`,
            );
          }

          return hydratedProduct;
        },
      );

      return mapProductToResponseDto(record);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async update(
    businessId: number,
    productId: number,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const existing = await this.ensureProductExists(
      businessId,
      productId,
      true,
    );

    if (existing.deleted_at) {
      throw new BadRequestException(
        'Deleted products cannot be updated. Restore the product first.',
      );
    }

    if (dto.productTypeId !== undefined) {
      await this.ensureProductTypeExists(businessId, dto.productTypeId);
    }

    try {
      const record = await this.productsRepository.update(productId, {
        ...(dto.productTypeId !== undefined
          ? { product_type_id: dto.productTypeId }
          : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description }
          : {}),
        ...(dto.internalCode !== undefined
          ? { internal_code: dto.internalCode }
          : {}),
        ...(dto.basePrice !== undefined ? { base_price: dto.basePrice } : {}),
        ...(dto.imageUrl !== undefined ? { image_url: dto.imageUrl } : {}),
        ...(dto.productStatus !== undefined
          ? { product_status: dto.productStatus }
          : {}),
        ...(dto.visibleInCatalog !== undefined
          ? { visible_in_catalog: dto.visibleInCatalog ? 1 : 0 }
          : {}),
        updated_at: new Date(),
        ...(dto.imagePublicId !== undefined
          ? { image_public_id: dto.imagePublicId }
          : {}),
      });

      return mapProductToResponseDto(record);
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async softDelete(
    businessId: number,
    productId: number,
    dto: DeleteProductDto,
  ): Promise<ProductResponseDto> {
    const existing = await this.ensureProductExists(
      businessId,
      productId,
      true,
    );

    if (existing.deleted_at) {
      throw new BadRequestException(`Product ${productId} is already deleted.`);
    }

    const record = await this.productsRepository.update(productId, {
      deleted_at: new Date(),
      deletion_reason: dto.deletionReason,
      updated_at: new Date(),
    });

    return mapProductToResponseDto(record);
  }

  async restore(
    businessId: number,
    productId: number,
    dto?: RestoreProductDto,
  ): Promise<ProductResponseDto> {
    const existing = await this.ensureProductExists(
      businessId,
      productId,
      true,
    );

    if (!existing.deleted_at) {
      throw new BadRequestException(`Product ${productId} is not deleted.`);
    }

    await this.ensureProductTypeExists(businessId, existing.product_type_id);

    const record = await this.productsRepository.update(productId, {
      product_status: dto?.productStatus ?? product_product_status.active,
      deleted_at: null,
      deletion_reason: null,
      updated_at: new Date(),
    });

    return mapProductToResponseDto(record);
  }

  async getCatalog(businessId: number): Promise<BusinessCatalogResponseDto> {
    await this.ensureBusinessExists(businessId);

    const records = await this.productsRepository.findCatalog(businessId);
    return mapProductsToCatalogResponseDto(businessId, records);
  }

  async getBaseCatalog(
    businessId: number,
  ): Promise<BusinessCatalogResponseDto> {
    return this.getCatalog(businessId);
  }

  private async ensureBusinessExists(businessId: number) {
    const business = await this.productsRepository.findBusinessById(businessId);

    if (!business) {
      throw new NotFoundException(`Business ${businessId} was not found.`);
    }

    return business;
  }

  private async ensureProductTypeExists(
    businessId: number,
    productTypeId: number,
  ) {
    const productType = await this.productsRepository.findProductTypeById(
      businessId,
      productTypeId,
    );

    if (!productType) {
      throw new NotFoundException(
        `Product type ${productTypeId} was not found for business ${businessId}.`,
      );
    }

    return productType;
  }

  private async ensureProductExists(
    businessId: number,
    productId: number,
    includeDeleted = false,
  ) {
    await this.ensureBusinessExists(businessId);

    const product = await this.productsRepository.findById(
      businessId,
      productId,
      includeDeleted,
    );

    if (!product) {
      throw new NotFoundException(
        `Product ${productId} was not found for business ${businessId}.`,
      );
    }

    return product;
  }

  private handlePrismaWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        `Unique constraint violation on ${this.formatPrismaUniqueTarget(
          error.meta?.target,
        )}.`,
      );
    }

    throw error;
  }

  private formatPrismaUniqueTarget(target: unknown): string {
    if (typeof target === 'string' && target.trim().length > 0) {
      return target;
    }

    if (Array.isArray(target)) {
      const fields = target.filter(
        (item): item is string => typeof item === 'string',
      );

      if (fields.length > 0) {
        return fields.join(', ');
      }
    }

    return 'unique field';
  }
}
