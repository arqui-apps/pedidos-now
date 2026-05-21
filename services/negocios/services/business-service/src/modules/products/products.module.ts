import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProductsService } from './application/services/products.service';
import { PrismaProductsRepository } from './infrastructure/repositories/prisma-products.repository';
import { BusinessCatalogController } from './presentation/controllers/business-catalog.controller';
import { BusinessProductsController } from './presentation/controllers/business-products.controller';
import { InternalBusinessCatalogController } from './presentation/controllers/internal-business-catalog.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    BusinessProductsController,
    BusinessCatalogController,
    InternalBusinessCatalogController,
  ],
  providers: [ProductsService, PrismaProductsRepository],
  exports: [ProductsService, PrismaProductsRepository],
})
export class ProductsModule {}
