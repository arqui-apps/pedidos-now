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
  ],
})
export class AppModule {}
