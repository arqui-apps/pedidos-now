import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DeliveriesService } from './application/services/deliveries.service';
import { DeliveriesRepository } from './infrastructure/repositories/deliveries.repository';
import { DeliveriesInternalController } from './presentation/controllers/deliveries-internal.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DeliveriesInternalController],
  providers: [DeliveriesService, DeliveriesRepository],
  exports: [DeliveriesService, DeliveriesRepository],
})
export class DeliveriesModule {}
