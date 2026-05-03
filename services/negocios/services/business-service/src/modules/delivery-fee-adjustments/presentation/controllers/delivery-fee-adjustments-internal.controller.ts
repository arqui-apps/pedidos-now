import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { DeliveryFeeAdjustmentsService } from '../../application/services/delivery-fee-adjustments.service';
import { CreateDeliveryFeeAdjustmentDto } from '../dto/create-delivery-fee-adjustment.dto';
import { DeliveryFeeAdjustmentResponseDto } from '../dto/delivery-fee-adjustment-response.dto';
import { ResolveDeliveryFeeAdjustmentDto } from '../dto/resolve-delivery-fee-adjustment.dto';

@ApiTags('Delivery Fee Adjustments (Internal Integrations)')
@Controller('internal/business-orders/delivery/fee-adjustments')
export class DeliveryFeeAdjustmentsInternalController {
  constructor(
    private readonly deliveryFeeAdjustmentsService: DeliveryFeeAdjustmentsService,
  ) {}

  @Post('request')
  @ApiOperation({
    summary: 'Create a local delivery fee adjustment request.',
  })
  @ApiCreatedResponse({ type: DeliveryFeeAdjustmentResponseDto })
  async createRequest(
    @Body() dto: CreateDeliveryFeeAdjustmentDto,
  ): Promise<DeliveryFeeAdjustmentResponseDto> {
    return this.deliveryFeeAdjustmentsService.createRequest(dto);
  }

  @Get('by-order/:externalOrderCode')
  @ApiOperation({
    summary: 'List local delivery fee adjustments by business order code.',
  })
  @ApiParam({ name: 'externalOrderCode', type: 'string' })
  @ApiOkResponse({ type: DeliveryFeeAdjustmentResponseDto, isArray: true })
  async listByExternalOrderCode(
    @Param('externalOrderCode') externalOrderCode: string,
  ): Promise<DeliveryFeeAdjustmentResponseDto[]> {
    return this.deliveryFeeAdjustmentsService.listByExternalOrderCode(
      externalOrderCode,
    );
  }

  @Get('by-logistics-order/:externalLogisticsOrderCode')
  @ApiOperation({
    summary: 'List local delivery fee adjustments by logistics order code.',
  })
  @ApiParam({ name: 'externalLogisticsOrderCode', type: 'string' })
  @ApiOkResponse({ type: DeliveryFeeAdjustmentResponseDto, isArray: true })
  async listByExternalLogisticsOrderCode(
    @Param('externalLogisticsOrderCode') externalLogisticsOrderCode: string,
  ): Promise<DeliveryFeeAdjustmentResponseDto[]> {
    return this.deliveryFeeAdjustmentsService.listByExternalLogisticsOrderCode(
      externalLogisticsOrderCode,
    );
  }

  @Post('resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Resolve a local delivery fee adjustment request as approved, rejected, applied or cancelled.',
  })
  @ApiOkResponse({ type: DeliveryFeeAdjustmentResponseDto })
  async resolve(
    @Body() dto: ResolveDeliveryFeeAdjustmentDto,
  ): Promise<DeliveryFeeAdjustmentResponseDto> {
    return this.deliveryFeeAdjustmentsService.resolve(dto);
  }
}
