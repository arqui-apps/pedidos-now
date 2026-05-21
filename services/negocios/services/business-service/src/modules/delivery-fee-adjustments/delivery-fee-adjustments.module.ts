import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DeliveryFeeAdjustmentsService } from './application/services/delivery-fee-adjustments.service';
import { DeliveryFeeAdjustmentsRepository } from './infrastructure/repositories/delivery-fee-adjustments.repository';
import { DeliveryFeeAdjustmentsInternalController } from './presentation/controllers/delivery-fee-adjustments-internal.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveryFeeAdjustmentsInternalController],
  providers: [DeliveryFeeAdjustmentsService, DeliveryFeeAdjustmentsRepository],
  exports: [DeliveryFeeAdjustmentsService, DeliveryFeeAdjustmentsRepository],
})
export class DeliveryFeeAdjustmentsModule {}
