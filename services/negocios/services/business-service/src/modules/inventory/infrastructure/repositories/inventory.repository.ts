import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  inventory_reservation_reservation_status,
  inventory_movement_movement_type,
  Prisma,
} from '@prisma/client';
import {
  UpdateProductStockDto,
  ValidateAndReserveDto,
} from '../../presentation/dto/inventory.dto';

@Injectable()
export class InventoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStockByBusiness(businessId: number) {
    const stock = await this.prisma.product_stock.findMany({
      where: { product: { business_id: businessId, deleted_at: null } },
      include: { product: { select: { name: true, internal_code: true } } },
    });
    return stock;
  }

  async getStockByProduct(businessId: number, productId: number) {
    const stock = await this.prisma.product_stock.findFirst({
      where: {
        product_id: productId,
        product: { business_id: businessId, deleted_at: null },
      },
      include: { product: true },
    });

    if (!stock) {
      throw new NotFoundException('Stock or product not found');
    }
    return stock;
  }

  async updateProductStock(
    businessId: number,
    productId: number,
    dto: UpdateProductStockDto,
  ) {
    const transactionResult = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        if (
          dto.availableQuantity === undefined &&
          dto.minimumAlertQuantity === undefined
        ) {
          throw new BadRequestException(
            'At least one stock field must be provided.',
          );
        }

        const existingStock = await tx.product_stock.findFirst({
          where: {
            product_id: productId,
            product: { business_id: businessId, deleted_at: null },
          },
          include: { product: true },
        });

        if (!existingStock) {
          throw new NotFoundException('Stock or product not found');
        }

        const previousAvailableQuantity = existingStock.available_quantity;
        const newAvailableQuantity =
          dto.availableQuantity ?? previousAvailableQuantity;

        const updatedStock = await tx.product_stock.update({
          where: { product_id: productId },
          data: {
            available_quantity: newAvailableQuantity,
            ...(dto.minimumAlertQuantity !== undefined
              ? { minimum_alert_quantity: dto.minimumAlertQuantity }
              : {}),
            last_updated_at: new Date(),
            updated_at: new Date(),
          },
          include: { product: true },
        });

        if (
          dto.availableQuantity !== undefined &&
          dto.availableQuantity !== previousAvailableQuantity
        ) {
          await tx.inventory_movement.create({
            data: {
              product_id: productId,
              movement_type: inventory_movement_movement_type.adjustment,
              quantity: newAvailableQuantity - previousAvailableQuantity,
              previous_quantity: previousAvailableQuantity,
              new_quantity: newAvailableQuantity,
              source_reference: 'manual-stock-adjustment',
              reason: dto.reason ?? 'Manual stock adjustment',
            },
          });
        }

        return updatedStock;
      },
    );

    return transactionResult;
  }

  async createReservationWithTransaction(data: ValidateAndReserveDto) {
    const transactionResult = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Validate Stock
        for (const item of data.details) {
          const stock = await tx.product_stock.findUnique({
            where: { product_id: item.productId },
          });
          if (!stock || stock.available_quantity < item.quantity) {
            throw new ConflictException(
              `Insufficient stock for product ID ${item.productId}`,
            );
          }
        }

        // 2. Create Reservation
        const reservation = await tx.inventory_reservation.create({
          data: {
            reservation_code: data.reservationCode,
            business_id: data.businessId,
            external_customer_id: data.externalCustomerId,
            reservation_status: inventory_reservation_reservation_status.active,
            expires_at: new Date(data.expiresAt),
            inventory_reservation_detail: {
              create: data.details.map((d) => ({
                product_id: d.productId,
                requested_quantity: d.quantity,
                base_unit_price_snapshot: d.baseUnitPrice,
                base_subtotal_snapshot: d.baseSubtotal,
              })),
            },
          },
        });

        // 3. Update Stock & Record Movements
        for (const item of data.details) {
          const stock = await tx.product_stock.update({
            where: { product_id: item.productId },
            data: {
              available_quantity: { decrement: item.quantity },
              reserved_quantity: { increment: item.quantity },
            },
          });

          await tx.inventory_movement.create({
            data: {
              product_id: item.productId,
              movement_type: inventory_movement_movement_type.reservation,
              quantity: item.quantity,
              previous_quantity: stock.available_quantity + item.quantity,
              new_quantity: stock.available_quantity,
              source_reference: data.reservationCode,
            },
          });
        }

        return reservation;
      },
    );

    return transactionResult;
  }

  async releaseReservation(reservationCode: string, reason?: string) {
    const transactionResult = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const reservation = await tx.inventory_reservation.findUnique({
          where: { reservation_code: reservationCode },
          include: { inventory_reservation_detail: true },
        });

        if (!reservation || reservation.reservation_status !== 'active') {
          throw new ConflictException('Reservation not found or not active');
        }

        for (const detail of reservation.inventory_reservation_detail) {
          const stock = await tx.product_stock.update({
            where: { product_id: detail.product_id },
            data: {
              available_quantity: { increment: detail.requested_quantity },
              reserved_quantity: { decrement: detail.requested_quantity },
            },
          });

          await tx.inventory_movement.create({
            data: {
              product_id: detail.product_id,
              movement_type:
                inventory_movement_movement_type.reservation_release,
              quantity: detail.requested_quantity,
              previous_quantity:
                stock.available_quantity - detail.requested_quantity,
              new_quantity: stock.available_quantity,
              source_reference: reservationCode,
              reason: reason || 'Reservation released',
            },
          });
        }

        const updatedReservation = await tx.inventory_reservation.update({
          where: { reservation_code: reservationCode },
          data: {
            reservation_status:
              inventory_reservation_reservation_status.released,
            released_at: new Date(),
            release_reason: reason,
          },
        });

        return updatedReservation;
      },
    );

    return transactionResult;
  }

  async cancelConfirmedReservation(reservationCode: string, reason?: string) {
    const transactionResult = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const reservation = await tx.inventory_reservation.findUnique({
          where: { reservation_code: reservationCode },
          include: { inventory_reservation_detail: true },
        });

        if (!reservation || reservation.reservation_status !== 'confirmed') {
          throw new ConflictException(
            'Reservation not found or cannot be cancelled from confirmed status',
          );
        }

        for (const detail of reservation.inventory_reservation_detail) {
          const stock = await tx.product_stock.update({
            where: { product_id: detail.product_id },
            data: {
              available_quantity: { increment: detail.requested_quantity },
            },
          });

          await tx.inventory_movement.create({
            data: {
              product_id: detail.product_id,
              movement_type:
                inventory_movement_movement_type.order_cancellation,
              quantity: detail.requested_quantity,
              previous_quantity:
                stock.available_quantity - detail.requested_quantity,
              new_quantity: stock.available_quantity,
              source_reference: reservationCode,
              reason: reason || 'Confirmed reservation cancelled',
            },
          });
        }

        const updatedReservation = await tx.inventory_reservation.update({
          where: { reservation_code: reservationCode },
          data: {
            reservation_status:
              inventory_reservation_reservation_status.cancelled,
            released_at: new Date(),
            release_reason: reason,
          },
        });

        return updatedReservation;
      },
    );

    return transactionResult;
  }

  async confirmReservation(reservationCode: string) {
    const transactionResult = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const reservation = await tx.inventory_reservation.findUnique({
          where: { reservation_code: reservationCode },
          include: { inventory_reservation_detail: true },
        });

        if (!reservation || reservation.reservation_status !== 'active') {
          throw new ConflictException(
            'Reservation not found or cannot be confirmed',
          );
        }

        for (const detail of reservation.inventory_reservation_detail) {
          // Al confirmar, el stock disponible ya se descontó en la reserva.
          // Solo necesitamos descontar el stock reservado porque ya es una venta en firme.
          const stock = await tx.product_stock.update({
            where: { product_id: detail.product_id },
            data: {
              reserved_quantity: { decrement: detail.requested_quantity },
            },
          });

          await tx.inventory_movement.create({
            data: {
              product_id: detail.product_id,
              movement_type:
                inventory_movement_movement_type.order_confirmation,
              quantity: detail.requested_quantity,
              previous_quantity: stock.available_quantity,
              new_quantity: stock.available_quantity,
              source_reference: reservationCode,
              reason: 'Reservation confirmed for order',
            },
          });
        }

        const updatedReservation = await tx.inventory_reservation.update({
          where: { reservation_code: reservationCode },
          data: {
            reservation_status:
              inventory_reservation_reservation_status.confirmed,
            confirmed_at: new Date(),
          },
        });

        return updatedReservation;
      },
    );

    return transactionResult;
  }
}
