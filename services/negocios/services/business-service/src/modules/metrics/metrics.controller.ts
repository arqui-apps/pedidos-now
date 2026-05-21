import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RebuildMetricsDto } from './dto/rebuild-metrics.dto';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('daily')
  getDailyMetric(
    @Query('businessId') businessId: string,
    @Query('date') date: string,
  ) {
    return this.metricsService.getDailyMetric(businessId, date);
  }

  @Get('range')
  getRangeMetrics(
    @Query('businessId') businessId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.metricsService.getRangeMetrics(businessId, startDate, endDate);
  }

  @Get('summary')
  getSummary(
    @Query('businessId') businessId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.metricsService.getSummary(businessId, startDate, endDate);
  }

  @Post('rebuild')
  rebuild(@Body() dto: RebuildMetricsDto) {
    return this.metricsService.rebuild(dto);
  }
}
