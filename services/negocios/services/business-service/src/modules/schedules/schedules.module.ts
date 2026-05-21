import { Module } from '@nestjs/common';
import { SchedulesService } from './application/services/schedules.service';
import { SCHEDULES_REPOSITORY } from './domain/repositories/schedules.repository';
import { PrismaSchedulesRepository } from './infrastructure/repositories/prisma-schedules.repository';
import { SchedulesController } from './presentation/controllers/schedules.controller';

@Module({
  controllers: [SchedulesController],
  providers: [
    SchedulesService,
    {
      provide: SCHEDULES_REPOSITORY,
      useClass: PrismaSchedulesRepository,
    },
  ],
})
export class SchedulesModule {}
