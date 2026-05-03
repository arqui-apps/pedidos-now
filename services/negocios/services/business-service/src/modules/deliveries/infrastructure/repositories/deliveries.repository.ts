import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  business_order_delivery_delivery_status,
  business_order_delivery_status_history_new_status,
  business_order_delivery_status_history_previous_status,
  business_order_delivery_status_history_status_origin,
  business_order_order_status,
} from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LinkBusinessOrderDeliveryDto } from '../../presentation/dto/link-business-order-delivery.dto';
import { UpdateBusinessOrderDeliveryStatusDto } from '../../presentation/dto/update-business-order-delivery-status.dto';

const deliveryWithRelations =
  Prisma.validator<Prisma.business_order_deliveryDefaultArgs>()({
    include: {
      business_order: true,
      business_order_delivery_status_history: {
        orderBy: { created_at: 'asc' },
      },
    },
  });

export type BusinessOrderDeliveryRecord =
  Prisma.business_order_deliveryGetPayload<typeof deliveryWithRelations>;

type PrismaDeliveriesClient = PrismaService | Prisma.TransactionClient;

type DeliveryLookupInput = {
  externalOrderCode?: string;
  externalDeliveryCode?: string;
  externalLogisticsOrderCode?: string;
};

@Injectable()
export class DeliveriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrderByExternalOrderCode(
    externalOrderCode: string,
    client: PrismaDeliveriesClient = this.prisma,
  ) {
    return client.business_order.findUnique({
      where: { external_order_code: externalOrderCode },
      include: {
        business_order_delivery: true,
      },
    });
  }

  async findByExternalOrderCode(
    externalOrderCode: string,
    client: PrismaDeliveriesClient = this.prisma,
  ): Promise<BusinessOrderDeliveryRecord | null> {
    return this.findByIdentifiers({ externalOrderCode }, client);
  }

  async findByExternalLogisticsOrderCode(
    externalLogisticsOrderCode: string,
    client: PrismaDeliveriesClient = this.prisma,
  ): Promise<BusinessOrderDeliveryRecord | null> {
    return this.findByIdentifiers({ externalLogisticsOrderCode }, client);
  }

  async findByIdentifiers(
    lookup: DeliveryLookupInput,
    client: PrismaDeliveriesClient = this.prisma,
  ): Promise<BusinessOrderDeliveryRecord | null> {
    this.ensureAtLeastOneIdentifier(lookup);

    const where = this.buildDeliveryLookupWhere(lookup);

    return client.business_order_delivery.findFirst({
      where,
      include: deliveryWithRelations.include,
    });
  }

  async createLink(
    dto: LinkBusinessOrderDeliveryDto,
  ): Promise<BusinessOrderDeliveryRecord> {
    try {
      return await this.prisma.$transaction(
        async (tx: Prisma.TransactionClient) => {
          const order = await this.findOrderByExternalOrderCode(
            dto.externalOrderCode,
            tx,
          );

          if (!order) {
            throw new NotFoundException(
              `Business order with external code ${dto.externalOrderCode} was not found.`,
            );
          }

          if (order.business_order_delivery) {
            throw new ConflictException(
              `Delivery is already linked to order ${dto.externalOrderCode}.`,
            );
          }

          this.ensureOrderStatusAllowsDeliveryLink(order.order_status);

          await tx.business_order_delivery.create({
            data: {
              business_order_id: order.business_order_id,
              delivery_type: dto.deliveryType,
              delivery_status:
                business_order_delivery_delivery_status.pending_assignment,
              branch_id: dto.branchId ?? 0,
              external_delivery_code: dto.externalDeliveryCode,
              external_logistics_order_code: dto.externalLogisticsOrderCode,
              external_courier_id: dto.externalCourierId,
              recipient_name_snapshot: dto.recipientNameSnapshot,
              recipient_phone_snapshot: dto.recipientPhoneSnapshot,
              delivery_address_snapshot: dto.deliveryAddressSnapshot,
              delivery_reference_snapshot: dto.deliveryReferenceSnapshot,
              delivery_notes_snapshot: dto.deliveryNotesSnapshot,
              estimated_distance_km: dto.estimatedDistanceKm,
              estimated_travel_minutes: dto.estimatedTravelMinutes,
              base_delivery_fee_snapshot: dto.baseDeliveryFeeSnapshot ?? 0,
              final_delivery_fee_snapshot: dto.finalDeliveryFeeSnapshot ?? 0,
              has_fee_adjustment: 0,
              business_order_delivery_status_history: {
                create: {
                  previous_status: null,
                  new_status:
                    business_order_delivery_status_history_new_status.pending_assignment,
                  status_origin:
                    business_order_delivery_status_history_status_origin.couriers,
                  observation:
                    dto.observation ??
                    'Delivery link created from logistics integration.',
                },
              },
            },
          });

          const hydratedDelivery = await this.findByExternalOrderCode(
            dto.externalOrderCode,
            tx,
          );

          if (!hydratedDelivery) {
            throw new NotFoundException(
              `Delivery for order ${dto.externalOrderCode} was created but could not be reloaded.`,
            );
          }

          return hydratedDelivery;
        },
      );
    } catch (error) {
      this.handlePrismaWriteError(error);
    }
  }

  async updateStatus(
    dto: UpdateBusinessOrderDeliveryStatusDto,
  ): Promise<BusinessOrderDeliveryRecord> {
    this.ensureAtLeastOneIdentifier(dto);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingDelivery = await this.findByIdentifiers(dto, tx);

      if (!existingDelivery) {
        throw new NotFoundException(
          'Delivery for the provided identifiers was not found.',
        );
      }

      this.ensureValidStatusTransition(
        existingDelivery.delivery_status,
        dto.newStatus,
      );

      await tx.business_order_delivery.update({
        where: {
          business_order_delivery_id:
            existingDelivery.business_order_delivery_id,
        },
        data: {
          delivery_status: dto.newStatus,
          ...(dto.externalCourierId !== undefined
            ? { external_courier_id: dto.externalCourierId }
            : {}),
          ...this.buildStatusTimestampData(dto.newStatus),
          updated_at: new Date(),
        },
      });

      await tx.business_order_delivery_status_history.create({
        data: {
          business_order_delivery_id:
            existingDelivery.business_order_delivery_id,
          previous_status: this.mapStatusToHistoryPrevious(
            existingDelivery.delivery_status,
          ),
          new_status: this.mapStatusToHistoryNew(dto.newStatus),
          status_origin: dto.statusOrigin,
          observation: dto.observation,
        },
      });

      const hydratedDelivery = await this.findByIdentifiers(dto, tx);

      if (!hydratedDelivery) {
        throw new NotFoundException(
          'Delivery was updated but could not be reloaded.',
        );
      }

      return hydratedDelivery;
    });
  }

  private buildDeliveryLookupWhere(
    lookup: DeliveryLookupInput,
  ): Prisma.business_order_deliveryWhereInput {
    const orConditions: Prisma.business_order_deliveryWhereInput[] = [];

    if (lookup.externalOrderCode) {
      orConditions.push({
        business_order: {
          external_order_code: lookup.externalOrderCode,
        },
      });
    }

    if (lookup.externalDeliveryCode) {
      orConditions.push({
        external_delivery_code: lookup.externalDeliveryCode,
      });
    }

    if (lookup.externalLogisticsOrderCode) {
      orConditions.push({
        external_logistics_order_code: lookup.externalLogisticsOrderCode,
      });
    }

    return orConditions.length === 1 ? orConditions[0] : { OR: orConditions };
  }

  private ensureAtLeastOneIdentifier(lookup: DeliveryLookupInput): void {
    if (
      !lookup.externalOrderCode &&
      !lookup.externalDeliveryCode &&
      !lookup.externalLogisticsOrderCode
    ) {
      throw new BadRequestException(
        'At least one delivery identifier must be provided.',
      );
    }
  }

  private ensureOrderStatusAllowsDeliveryLink(
    orderStatus: business_order_order_status,
  ): void {
    switch (orderStatus) {
      case business_order_order_status.confirmed:
      case business_order_order_status.preparing:
      case business_order_order_status.ready_for_pickup:
      case business_order_order_status.dispatched:
        return;
      default:
        throw new ConflictException(
          `Order status ${orderStatus} does not allow linking a delivery yet.`,
        );
    }
  }

  private ensureValidStatusTransition(
    currentStatus: business_order_delivery_delivery_status,
    nextStatus: business_order_delivery_delivery_status,
  ): void {
    if (currentStatus === nextStatus) {
      return;
    }

    switch (currentStatus) {
      case business_order_delivery_delivery_status.pending_assignment:
        if (
          nextStatus ===
            business_order_delivery_delivery_status.courier_assigned ||
          nextStatus === business_order_delivery_delivery_status.cancelled
        ) {
          return;
        }
        break;
      case business_order_delivery_delivery_status.courier_assigned:
        if (
          nextStatus ===
            business_order_delivery_delivery_status.ready_for_pickup ||
          nextStatus === business_order_delivery_delivery_status.cancelled
        ) {
          return;
        }
        break;
      case business_order_delivery_delivery_status.ready_for_pickup:
        if (
          nextStatus === business_order_delivery_delivery_status.picked_up ||
          nextStatus === business_order_delivery_delivery_status.cancelled
        ) {
          return;
        }
        break;
      case business_order_delivery_delivery_status.picked_up:
        if (
          nextStatus === business_order_delivery_delivery_status.in_transit ||
          nextStatus ===
            business_order_delivery_delivery_status.delivery_failed ||
          nextStatus === business_order_delivery_delivery_status.cancelled
        ) {
          return;
        }
        break;
      case business_order_delivery_delivery_status.in_transit:
        if (
          nextStatus === business_order_delivery_delivery_status.delivered ||
          nextStatus ===
            business_order_delivery_delivery_status.delivery_failed ||
          nextStatus === business_order_delivery_delivery_status.cancelled
        ) {
          return;
        }
        break;
      case business_order_delivery_delivery_status.delivered:
      case business_order_delivery_delivery_status.delivery_failed:
      case business_order_delivery_delivery_status.cancelled:
        break;
      default:
        break;
    }

    throw new ConflictException(
      `Invalid delivery status transition from ${currentStatus} to ${nextStatus}.`,
    );
  }

  private buildStatusTimestampData(
    newStatus: business_order_delivery_delivery_status,
  ): Prisma.business_order_deliveryUpdateInput {
    switch (newStatus) {
      case business_order_delivery_delivery_status.courier_assigned:
        return { assigned_at: new Date() };
      case business_order_delivery_delivery_status.picked_up:
        return { picked_up_at: new Date() };
      case business_order_delivery_delivery_status.delivered:
        return { delivered_at: new Date() };
      case business_order_delivery_delivery_status.cancelled:
        return { cancelled_at: new Date() };
      default:
        return {};
    }
  }

  private mapStatusToHistoryNew(
    status: business_order_delivery_delivery_status,
  ): business_order_delivery_status_history_new_status {
    switch (status) {
      case business_order_delivery_delivery_status.pending_assignment:
        return business_order_delivery_status_history_new_status.pending_assignment;
      case business_order_delivery_delivery_status.courier_assigned:
        return business_order_delivery_status_history_new_status.courier_assigned;
      case business_order_delivery_delivery_status.ready_for_pickup:
        return business_order_delivery_status_history_new_status.ready_for_pickup;
      case business_order_delivery_delivery_status.picked_up:
        return business_order_delivery_status_history_new_status.picked_up;
      case business_order_delivery_delivery_status.in_transit:
        return business_order_delivery_status_history_new_status.in_transit;
      case business_order_delivery_delivery_status.delivered:
        return business_order_delivery_status_history_new_status.delivered;
      case business_order_delivery_delivery_status.delivery_failed:
        return business_order_delivery_status_history_new_status.delivery_failed;
      case business_order_delivery_delivery_status.cancelled:
        return business_order_delivery_status_history_new_status.cancelled;
    }
  }

  private mapStatusToHistoryPrevious(
    status: business_order_delivery_delivery_status,
  ): business_order_delivery_status_history_previous_status {
    switch (status) {
      case business_order_delivery_delivery_status.pending_assignment:
        return business_order_delivery_status_history_previous_status.pending_assignment;
      case business_order_delivery_delivery_status.courier_assigned:
        return business_order_delivery_status_history_previous_status.courier_assigned;
      case business_order_delivery_delivery_status.ready_for_pickup:
        return business_order_delivery_status_history_previous_status.ready_for_pickup;
      case business_order_delivery_delivery_status.picked_up:
        return business_order_delivery_status_history_previous_status.picked_up;
      case business_order_delivery_delivery_status.in_transit:
        return business_order_delivery_status_history_previous_status.in_transit;
      case business_order_delivery_delivery_status.delivered:
        return business_order_delivery_status_history_previous_status.delivered;
      case business_order_delivery_delivery_status.delivery_failed:
        return business_order_delivery_status_history_previous_status.delivery_failed;
      case business_order_delivery_delivery_status.cancelled:
        return business_order_delivery_status_history_previous_status.cancelled;
    }
  }

  private handlePrismaWriteError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        `Unique constraint violation on ${this.formatPrismaUniqueTarget(
          error.meta?.target,
        )}.`,
      );
    }

    throw error;
  }

  private formatPrismaUniqueTarget(target: unknown): string {
    if (typeof target === 'string' && target.trim().length > 0) {
      return target;
    }

    if (Array.isArray(target)) {
      const fields = target.filter(
        (item): item is string => typeof item === 'string',
      );

      if (fields.length > 0) {
        return fields.join(', ');
      }
    }

    return 'unique field';
  }
}
