import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from '../../application/services/inventory.service';
import {
  ValidateAndReserveDto,
  ReleaseReservationDto,
  ConfirmReservationDto,
} from '../dto/inventory.dto';

@ApiTags('Inventory (Internal Integrations)')
@Controller('internal/business-orders')
export class InventoryInternalController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('validate-and-reserve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar disponibilidad y reservar stock' })
  async validateAndReserve(@Body() dto: ValidateAndReserveDto) {
    const result = await this.inventoryService.validateAndReserve(dto);
    return result;
  }

  @Post('release-reservation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liberar una reserva previamente hecha' })
  async releaseReservation(@Body() dto: ReleaseReservationDto) {
    const result = await this.inventoryService.releaseReservation(dto);
    return result;
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirmar una reserva para convertirla en pedido en firme',
  })
  async confirmReservation(@Body() dto: ConfirmReservationDto) {
    const result = await this.inventoryService.confirmReservation(dto);
    return result;
  }
}
