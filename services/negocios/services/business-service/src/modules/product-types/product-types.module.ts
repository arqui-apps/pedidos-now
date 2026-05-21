import { Module } from '@nestjs/common';
import { ProductTypesController } from './presentation/controllers/product-types.controller';
import { ProductTypesService } from './application/services/product-types.service';
import { ProductTypesRepository } from './infrastructure/repositories/product-types.repository';

@Module({
  controllers: [ProductTypesController],
  providers: [ProductTypesService, ProductTypesRepository],
  exports: [ProductTypesService, ProductTypesRepository],
})
export class ProductTypesModule {}
