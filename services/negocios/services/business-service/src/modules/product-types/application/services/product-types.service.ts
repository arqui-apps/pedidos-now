import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { product_type } from '@prisma/client';
import { CreateProductTypeDto } from '../../presentation/dto/create-product-type.dto';
import { SoftDeleteProductTypeDto } from '../../presentation/dto/soft-delete-product-type.dto';
import { UpdateProductTypeDto } from '../../presentation/dto/update-product-type.dto';
import { ProductTypesRepository } from '../../infrastructure/repositories/product-types.repository';

@Injectable()
export class ProductTypesService {
  constructor(
    private readonly productTypesRepository: ProductTypesRepository,
  ) {}

  async findAll(businessId: number): Promise<product_type[]> {
    await this.ensureBusinessExists(businessId);
    return this.productTypesRepository.findManyByBusiness(businessId);
  }

  async findOne(
    businessId: number,
    productTypeId: number,
  ): Promise<product_type> {
    await this.ensureBusinessExists(businessId);

    const productType = await this.productTypesRepository.findActiveById(
      businessId,
      productTypeId,
    );

    if (!productType) {
      throw new NotFoundException(
        `No se encontró el tipo de producto ${productTypeId} para el negocio ${businessId}`,
      );
    }

    return productType;
  }

  async create(
    businessId: number,
    dto: CreateProductTypeDto,
  ): Promise<product_type> {
    await this.ensureBusinessExists(businessId);

    const normalizedName = dto.name.trim();

    const existingWithSameName = await this.productTypesRepository.findByName(
      businessId,
      normalizedName,
    );

    if (existingWithSameName) {
      if (existingWithSameName.deleted_at) {
        throw new ConflictException(
          `Ya existe un tipo de producto con el nombre "${normalizedName}" en estado eliminado. Debes restaurarlo o usar otro nombre.`,
        );
      }

      throw new ConflictException(
        `Ya existe un tipo de producto con el nombre "${normalizedName}" para este negocio.`,
      );
    }

    return this.productTypesRepository.create({
      business_id: businessId,
      name: normalizedName,
      description: dto.description?.trim() || null,
      product_type_status: dto.product_type_status,
    });
  }

  async update(
    businessId: number,
    productTypeId: number,
    dto: UpdateProductTypeDto,
  ): Promise<product_type> {
    await this.ensureBusinessExists(businessId);

    const current = await this.productTypesRepository.findActiveById(
      businessId,
      productTypeId,
    );

    if (!current) {
      throw new NotFoundException(
        `No se encontró el tipo de producto ${productTypeId} para el negocio ${businessId}`,
      );
    }

    if (dto.name !== undefined) {
      const normalizedName = dto.name.trim();

      const existingWithSameName = await this.productTypesRepository.findByName(
        businessId,
        normalizedName,
      );

      if (
        existingWithSameName &&
        existingWithSameName.product_type_id !== productTypeId
      ) {
        if (existingWithSameName.deleted_at) {
          throw new ConflictException(
            `Ya existe un tipo de producto eliminado con el nombre "${normalizedName}". Debes restaurarlo o usar otro nombre.`,
          );
        }

        throw new ConflictException(
          `Ya existe un tipo de producto con el nombre "${normalizedName}" para este negocio.`,
        );
      }

      dto.name = normalizedName;
    }

    if (dto.description !== undefined) {
      dto.description = dto.description.trim();
    }

    return this.productTypesRepository.update(productTypeId, {
      name: dto.name,
      description: dto.description,
      product_type_status: dto.product_type_status,
    });
  }

  async softDelete(
    businessId: number,
    productTypeId: number,
    dto?: SoftDeleteProductTypeDto,
  ): Promise<product_type> {
    await this.ensureBusinessExists(businessId);

    const current = await this.productTypesRepository.findActiveById(
      businessId,
      productTypeId,
    );

    if (!current) {
      throw new NotFoundException(
        `No se encontró el tipo de producto ${productTypeId} para el negocio ${businessId}`,
      );
    }

    return this.productTypesRepository.softDelete(
      productTypeId,
      dto?.deletion_reason?.trim(),
    );
  }

  async restore(
    businessId: number,
    productTypeId: number,
  ): Promise<product_type> {
    await this.ensureBusinessExists(businessId);

    const current = await this.productTypesRepository.findAnyById(
      businessId,
      productTypeId,
    );

    if (!current) {
      throw new NotFoundException(
        `No se encontró el tipo de producto ${productTypeId} para el negocio ${businessId}`,
      );
    }

    if (!current.deleted_at) {
      throw new BadRequestException(
        `El tipo de producto ${productTypeId} ya está activo.`,
      );
    }

    return this.productTypesRepository.restore(productTypeId);
  }

  private async ensureBusinessExists(businessId: number): Promise<void> {
    const exists = await this.productTypesRepository.businessExists(businessId);

    if (!exists) {
      throw new NotFoundException(`No se encontró el negocio ${businessId}`);
    }
  }
}
