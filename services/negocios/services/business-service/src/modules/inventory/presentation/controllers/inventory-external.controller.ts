import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { InventoryService } from '../../application/services/inventory.service';
import { UpdateProductStockDto } from '../dto/inventory.dto';

@ApiTags('Inventory (External - Broker)')
@Controller('businesses/:businessId/inventory')
export class InventoryExternalController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener el inventario completo de un negocio' })
  @ApiParam({ name: 'businessId', type: 'number' })
  async getInventory(@Param('businessId', ParseIntPipe) businessId: number) {
    const result = await this.inventoryService.getInventorySummary(businessId);
    return result;
  }

  @Get('products/:productId')
  @ApiOperation({ summary: 'Obtener el stock de un producto específico' })
  @ApiParam({ name: 'businessId', type: 'number' })
  @ApiParam({ name: 'productId', type: 'number' })
  async getProductStock(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    const result = await this.inventoryService.getProductStock(
      businessId,
      productId,
    );
    return result;
  }

  @Patch('products/:productId/stock')
  @ApiOperation({
    summary: 'Actualizar stock disponible y alerta mínima de un producto',
  })
  @ApiParam({ name: 'businessId', type: 'number' })
  @ApiParam({ name: 'productId', type: 'number' })
  async updateProductStock(
    @Param('businessId', ParseIntPipe) businessId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductStockDto,
  ) {
    const result = await this.inventoryService.updateProductStock(
      businessId,
      productId,
      dto,
    );
    return result;
  }
}
