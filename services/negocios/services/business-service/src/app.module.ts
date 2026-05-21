import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env/env.validation';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductTypesModule } from './modules/product-types/product-types.module';
import { BusinessModule } from './modules/business/business.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OrdersModule } from './modules/orders/orders.module';
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DeliveryFeeAdjustmentsModule } from './modules/delivery-fee-adjustments/delivery-fee-adjustments.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    HealthModule,
    BusinessModule,
    SchedulesModule,
    ProductTypesModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    DeliveriesModule,
    DeliveryFeeAdjustmentsModule,
    PromotionsModule,
    MetricsModule,
  ],
})
export class AppModule {}
