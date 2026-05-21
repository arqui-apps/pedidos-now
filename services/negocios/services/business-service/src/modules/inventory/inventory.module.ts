import { Module } from '@nestjs/common';
import { InventoryExternalController } from './presentation/controllers/inventory-external.controller';
import { InventoryInternalController } from './presentation/controllers/inventory-internal.controller';
import { InventoryService } from './application/services/inventory.service';
import { InventoryRepository } from './infrastructure/repositories/inventory.repository';

@Module({
  controllers: [InventoryExternalController, InventoryInternalController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService],
})
export class InventoryModule {}
