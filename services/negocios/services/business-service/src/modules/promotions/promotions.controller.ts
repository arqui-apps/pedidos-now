import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePromotionRequestDto } from './dto/create-promotion-request.dto';
import { RespondPromotionRequestDto } from './dto/respond-promotion-request.dto';
import { SyncPromotionReferenceDto } from './dto/sync-promotion-reference.dto';
import { PromotionsService } from './promotions.service';

@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post('requests')
  createRequest(@Body() dto: CreatePromotionRequestDto) {
    return this.promotionsService.createRequest(dto);
  }

  @Get('requests')
  findRequests(
    @Query('businessId') businessId?: string,
    @Query('status') status?: string,
  ) {
    return this.promotionsService.findRequests({ businessId, status });
  }

  @Get('requests/:id')
  findRequestById(@Param('id') id: string) {
    return this.promotionsService.findRequestById(id);
  }

  @Patch('requests/:id/external-response')
  respondRequest(
    @Param('id') id: string,
    @Body() dto: RespondPromotionRequestDto,
  ) {
    return this.promotionsService.respondRequest(id, dto);
  }

  @Post('references/sync')
  syncReference(@Body() dto: SyncPromotionReferenceDto) {
    return this.promotionsService.syncReference(dto);
  }

  @Get('references')
  findReferences(
    @Query('businessId') businessId?: string,
    @Query('externalPromotionId') externalPromotionId?: string,
    @Query('status') status?: string,
  ) {
    return this.promotionsService.findReferences({
      businessId,
      externalPromotionId,
      status,
    });
  }

  @Get('sync-history')
  findSyncHistory(
    @Query('businessId') businessId?: string,
    @Query('externalPromotionId') externalPromotionId?: string,
  ) {
    return this.promotionsService.findSyncHistory({
      businessId,
      externalPromotionId,
    });
  }
}
