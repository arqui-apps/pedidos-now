import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from '../../application/services/orders.service';
import { BusinessOrderResponseDto } from '../dto/business-order-response.dto';
import { CreateBusinessOrderDto } from '../dto/create-business-order.dto';
import { ListBusinessOrdersQueryDto } from '../dto/list-business-orders-query.dto';
import { UpdateBusinessOrderStatusDto } from '../dto/update-business-order-status.dto';

@ApiTags('Business Orders')
@Controller('businesses/:businessId/orders')
export class BusinessOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a business order and reserve stock' })
  @ApiCreatedResponse({ type: BusinessOrderResponseDto })
  async create(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Body() dto: CreateBusinessOrderDto,
  ): Promise<BusinessOrderResponseDto> {
    return this.ordersService.create(businessId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List business orders' })
  @ApiOkResponse({ type: BusinessOrderResponseDto, isArray: true })
  async list(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Query() query: ListBusinessOrdersQueryDto,
  ): Promise<BusinessOrderResponseDto[]> {
    return this.ordersService.list(businessId, query);
  }

  @Get(':businessOrderId')
  @ApiOperation({ summary: 'Get business order by id' })
  @ApiOkResponse({ type: BusinessOrderResponseDto })
  async getById(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('businessOrderId', ParseIntPipe) businessOrderId: number,
  ): Promise<BusinessOrderResponseDto> {
    return this.ordersService.getById(businessId, businessOrderId);
  }

  @Patch(':businessOrderId/preparing')
  @ApiOperation({ summary: 'Move a business order to preparing status' })
  @ApiOkResponse({ type: BusinessOrderResponseDto })
  async markPreparing(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('businessOrderId', ParseIntPipe) businessOrderId: number,
    @Body() dto: UpdateBusinessOrderStatusDto,
  ): Promise<BusinessOrderResponseDto> {
    return this.ordersService.markPreparing(businessId, businessOrderId, dto);
  }

  @Patch(':businessOrderId/ready-for-pickup')
  @ApiOperation({ summary: 'Move a business order to ready for pickup status' })
  @ApiOkResponse({ type: BusinessOrderResponseDto })
  async markReadyForPickup(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('businessOrderId', ParseIntPipe) businessOrderId: number,
    @Body() dto: UpdateBusinessOrderStatusDto,
  ): Promise<BusinessOrderResponseDto> {
    return this.ordersService.markReadyForPickup(
      businessId,
      businessOrderId,
      dto,
    );
  }
}
