import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { BusinessService } from './application/services/business.service';
import { PrismaBusinessRepository } from './infrastructure/repositories/prisma-business.repository';
import { BusinessesController } from './presentation/controllers/businesses.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessesController],
  providers: [BusinessService, PrismaBusinessRepository],
  exports: [BusinessService, PrismaBusinessRepository],
})
export class BusinessModule {}
