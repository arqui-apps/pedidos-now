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
import { DeliveriesService } from '../../application/services/deliveries.service';
import { BusinessOrderDeliveryResponseDto } from '../dto/business-order-delivery-response.dto';
import { LinkBusinessOrderDeliveryDto } from '../dto/link-business-order-delivery.dto';
import { UpdateBusinessOrderDeliveryStatusDto } from '../dto/update-business-order-delivery-status.dto';

@ApiTags('Deliveries (Internal Integrations)')
@Controller('internal/business-orders')
export class DeliveriesInternalController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post('delivery/link')
  @ApiOperation({
    summary: 'Link a business order with its local delivery snapshot.',
  })
  @ApiCreatedResponse({ type: BusinessOrderDeliveryResponseDto })
  async linkDelivery(
    @Body() dto: LinkBusinessOrderDeliveryDto,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    return this.deliveriesService.linkDelivery(dto);
  }

  @Get(':externalOrderCode/delivery')
  @ApiOperation({
    summary: 'Get the local delivery snapshot by external order code.',
  })
  @ApiParam({ name: 'externalOrderCode', type: 'string' })
  @ApiOkResponse({ type: BusinessOrderDeliveryResponseDto })
  async getByExternalOrderCode(
    @Param('externalOrderCode') externalOrderCode: string,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    return this.deliveriesService.getByExternalOrderCode(externalOrderCode);
  }

  @Get('delivery/by-logistics-order/:externalLogisticsOrderCode')
  @ApiOperation({
    summary:
      'Get the local delivery snapshot by external logistics order code.',
  })
  @ApiParam({ name: 'externalLogisticsOrderCode', type: 'string' })
  @ApiOkResponse({ type: BusinessOrderDeliveryResponseDto })
  async getByExternalLogisticsOrderCode(
    @Param('externalLogisticsOrderCode') externalLogisticsOrderCode: string,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    return this.deliveriesService.getByExternalLogisticsOrderCode(
      externalLogisticsOrderCode,
    );
  }

  @Post('delivery/update-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update local delivery status from logistics events.',
  })
  @ApiOkResponse({ type: BusinessOrderDeliveryResponseDto })
  async updateStatus(
    @Body() dto: UpdateBusinessOrderDeliveryStatusDto,
  ): Promise<BusinessOrderDeliveryResponseDto> {
    return this.deliveriesService.updateStatus(dto);
  }
}
