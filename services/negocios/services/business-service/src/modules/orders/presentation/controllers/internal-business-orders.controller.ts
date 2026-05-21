import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from '../../application/services/orders.service';
import {
  BusinessOrderResponseDto,
  CancellationPenaltyEvaluationResponseDto,
} from '../dto/business-order-response.dto';
import { CancelBusinessOrderDto } from '../dto/cancel-business-order.dto';
import { ConfirmBusinessOrderDto } from '../dto/confirm-business-order.dto';
import { EvaluateCancellationPenaltyDto } from '../dto/evaluate-cancellation-penalty.dto';

@ApiTags('Business Orders (Internal Integrations)')
@Controller('internal/business-orders')
export class InternalBusinessOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get(':externalOrderCode')
  @ApiOperation({ summary: 'Get business order by external order code' })
  @ApiOkResponse({ type: BusinessOrderResponseDto })
  async getByExternalOrderCode(
    @Param('externalOrderCode') externalOrderCode: string,
  ): Promise<BusinessOrderResponseDto> {
    return this.ordersService.getByExternalOrderCode(externalOrderCode);
  }

  @Post('confirm-order')
  @ApiOperation({
    summary: 'Confirm a business order and consume the associated reservation',
  })
  @ApiOkResponse({ type: BusinessOrderResponseDto })
  async confirm(
    @Body() dto: ConfirmBusinessOrderDto,
  ): Promise<BusinessOrderResponseDto> {
    return this.ordersService.confirm(dto);
  }

  @Post('evaluate-cancellation-penalty')
  @ApiOperation({
    summary: 'Evaluate a cancellation penalty for a business order',
  })
  @ApiOkResponse({ type: CancellationPenaltyEvaluationResponseDto })
  async evaluateCancellationPenalty(
    @Body() dto: EvaluateCancellationPenaltyDto,
  ): Promise<CancellationPenaltyEvaluationResponseDto> {
    return this.ordersService.evaluateCancellationPenalty(dto);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel a business order' })
  @ApiOkResponse({ type: BusinessOrderResponseDto })
  async cancel(
    @Body() dto: CancelBusinessOrderDto,
  ): Promise<BusinessOrderResponseDto> {
    return this.ordersService.cancel(dto);
  }
}
