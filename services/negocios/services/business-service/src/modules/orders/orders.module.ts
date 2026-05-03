import { Module } from '@nestjs/common';
import { InventoryModule } from '../inventory/inventory.module';
import { OrdersService } from './application/services/orders.service';
import { PrismaOrdersRepository } from './infrastructure/repositories/prisma-orders.repository';
import { BusinessOrdersController } from './presentation/controllers/business-orders.controller';
import { InternalBusinessOrdersController } from './presentation/controllers/internal-business-orders.controller';

@Module({
  imports: [InventoryModule],
  controllers: [BusinessOrdersController, InternalBusinessOrdersController],
  providers: [OrdersService, PrismaOrdersRepository],
  exports: [OrdersService, PrismaOrdersRepository],
})
export class OrdersModule {}
