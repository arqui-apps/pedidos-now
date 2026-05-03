import { Injectable } from '@nestjs/common';
import { InventoryRepository } from '../../infrastructure/repositories/inventory.repository';
import {
  ValidateAndReserveDto,
  ReleaseReservationDto,
  ConfirmReservationDto,
  UpdateProductStockDto,
} from '../../presentation/dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  async getInventorySummary(businessId: number) {
    const summary =
      await this.inventoryRepository.getStockByBusiness(businessId);
    return summary;
  }

  async getProductStock(businessId: number, productId: number) {
    const stock = await this.inventoryRepository.getStockByProduct(
      businessId,
      productId,
    );
    return stock;
  }

  async updateProductStock(
    businessId: number,
    productId: number,
    dto: UpdateProductStockDto,
  ) {
    const result = await this.inventoryRepository.updateProductStock(
      businessId,
      productId,
      dto,
    );
    return result;
  }

  async validateAndReserve(dto: ValidateAndReserveDto) {
    const result =
      await this.inventoryRepository.createReservationWithTransaction(dto);
    return result;
  }

  async releaseReservation(dto: ReleaseReservationDto) {
    const result = await this.inventoryRepository.releaseReservation(
      dto.reservationCode,
      dto.reason,
    );
    return result;
  }
  async confirmReservation(dto: ConfirmReservationDto) {
    const result = await this.inventoryRepository.confirmReservation(
      dto.reservationCode,
    );
    return result;
  }
  async cancelConfirmedReservation(reservationCode: string, reason?: string) {
    const result = await this.inventoryRepository.cancelConfirmedReservation(
      reservationCode,
      reason,
    );
    return result;
  }
}
