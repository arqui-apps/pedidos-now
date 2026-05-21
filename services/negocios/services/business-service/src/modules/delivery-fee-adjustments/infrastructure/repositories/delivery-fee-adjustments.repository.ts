import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  business_order_delivery_delivery_status,
  business_order_delivery_fee_adjustment_adjustment_status,
} from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateDeliveryFeeAdjustmentDto } from '../../presentation/dto/create-delivery-fee-adjustment.dto';
import { ResolveDeliveryFeeAdjustmentDto } from '../../presentation/dto/resolve-delivery-fee-adjustment.dto';

const deliveryFeeAdjustmentWithRelations =
  Prisma.validator<Prisma.business_order_delivery_fee_adjustmentDefaultArgs>()({
    include: {
      business_order_delivery: {
        include: {
          business_order: true,
        },
      },
    },
  });

export type BusinessOrderDeliveryFeeAdjustmentRecord =
  Prisma.business_order_delivery_fee_adjustmentGetPayload<
    typeof deliveryFeeAdjustmentWithRelations
  >;

type PrismaDeliveryFeeAdjustmentsClient =
  | PrismaService
  | Prisma.TransactionClient;

type DeliveryLookupInput = {
  externalOrderCode?: string;
  externalDeliveryCode?: string;
  externalLogisticsOrderCode?: string;
};

@Injectable()
export class DeliveryFeeAdjustmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByExternalOrderCode(
    externalOrderCode: string,
    client: PrismaDeliveryFeeAdjustmentsClient = this.prisma,
  ): Promise<BusinessOrderDeliveryFeeAdjustmentRecord[]> {
    return client.business_order_delivery_fee_adjustment.findMany({
      where: {
        business_order_delivery: {
          business_order: {
            external_order_code: externalOrderCode,
          },
        },
      },
      include: deliveryFeeAdjustmentWithRelations.include,
      orderBy: { requested_at: 'asc' },
    });
  }

  async findManyByExternalLogisticsOrderCode(
    externalLogisticsOrderCode: string,
    client: PrismaDeliveryFeeAdjustmentsClient = this.prisma,
  ): Promise<BusinessOrderDeliveryFeeAdjustmentRecord[]> {
    return client.business_order_delivery_fee_adjustment.findMany({
      where: {
        business_order_delivery: {
          external_logistics_order_code: externalLogisticsOrderCode,
        },
      },
      include: deliveryFeeAdjustmentWithRelations.include,
      orderBy: { requested_at: 'asc' },
    });
  }

  async findById(
    businessOrderDeliveryFeeAdjustmentId: number,
    client: PrismaDeliveryFeeAdjustmentsClient = this.prisma,
  ): Promise<BusinessOrderDeliveryFeeAdjustmentRecord | null> {
    return client.business_order_delivery_fee_adjustment.findUnique({
      where: {
        business_order_delivery_fee_adjustment_id:
          businessOrderDeliveryFeeAdjustmentId,
      },
      include: deliveryFeeAdjustmentWithRelations.include,
    });
  }

  async createRequest(
    dto: CreateDeliveryFeeAdjustmentDto,
  ): Promise<BusinessOrderDeliveryFeeAdjustmentRecord> {
    this.ensureAtLeastOneIdentifier(dto);

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const delivery = await this.findDeliveryByIdentifiers(dto, tx);

      if (!delivery) {
        throw new NotFoundException(
          'Delivery for the provided identifiers was not found.',
        );
      }

      this.ensureDeliveryAllowsFeeAdjustment(delivery.delivery_status);

      const createdAdjustment =
        await tx.business_order_delivery_fee_adjustment.create({
          data: {
            business_order_delivery_id: delivery.business_order_delivery_id,
            external_courier_id:
              dto.externalCourierId ?? delivery.external_courier_id,
            requested_extra_fee: dto.requestedExtraFee,
            adjustment_status:
              business_order_delivery_fee_adjustment_adjustment_status.requested,
            reason_type: dto.reasonType,
            reason_detail: dto.reasonDetail,
          },
        });

      await tx.business_order_delivery.update({
        where: {
          business_order_delivery_id: delivery.business_order_delivery_id,
        },
        data: {
          has_fee_adjustment: 1,
          updated_at: new Date(),
        },
      });

      const hydratedAdjustment = await this.findById(
        createdAdjustment.business_order_delivery_fee_adjustment_id,
        tx,
      );

      if (!hydratedAdjustment) {
        throw new NotFoundException(
          `Delivery fee adjustment ${createdAdjustment.business_order_delivery_fee_adjustment_id} was created but could not be reloaded.`,
        );
      }

      return hydratedAdjustment;
    });
  }

  async resolve(
    dto: ResolveDeliveryFeeAdjustmentDto,
  ): Promise<BusinessOrderDeliveryFeeAdjustmentRecord> {
    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingAdjustment = await this.findById(
        dto.businessOrderDeliveryFeeAdjustmentId,
        tx,
      );

      if (!existingAdjustment) {
        throw new NotFoundException(
          `Delivery fee adjustment ${dto.businessOrderDeliveryFeeAdjustmentId} was not found.`,
        );
      }

      this.ensureValidResolutionTransition(
        existingAdjustment.adjustment_status,
        dto.adjustmentStatus,
      );

      const approvedExtraFee = this.resolveApprovedExtraFee(
        existingAdjustment,
        dto,
      );

      const updatedAdjustment =
        await tx.business_order_delivery_fee_adjustment.update({
          where: {
            business_order_delivery_fee_adjustment_id:
              existingAdjustment.business_order_delivery_fee_adjustment_id,
          },
          data: {
            adjustment_status: dto.adjustmentStatus,
            ...(approvedExtraFee !== undefined
              ? { approved_extra_fee: approvedExtraFee }
              : {}),
            resolved_at: new Date(),
            updated_at: new Date(),
          },
          include: deliveryFeeAdjustmentWithRelations.include,
        });

      if (
        dto.adjustmentStatus ===
        business_order_delivery_fee_adjustment_adjustment_status.applied
      ) {
        const currentFinalFee = new Prisma.Decimal(
          updatedAdjustment.business_order_delivery.final_delivery_fee_snapshot,
        );
        const appliedExtraFee = new Prisma.Decimal(
          updatedAdjustment.approved_extra_fee ?? 0,
        );

        await tx.business_order_delivery.update({
          where: {
            business_order_delivery_id:
              updatedAdjustment.business_order_delivery_id,
          },
          data: {
            final_delivery_fee_snapshot: currentFinalFee.plus(appliedExtraFee),
            has_fee_adjustment: 1,
            updated_at: new Date(),
          },
        });
      }

      const hydratedAdjustment = await this.findById(
        dto.businessOrderDeliveryFeeAdjustmentId,
        tx,
      );

      if (!hydratedAdjustment) {
        throw new NotFoundException(
          `Delivery fee adjustment ${dto.businessOrderDeliveryFeeAdjustmentId} was updated but could not be reloaded.`,
        );
      }

      return hydratedAdjustment;
    });
  }

  private async findDeliveryByIdentifiers(
    lookup: DeliveryLookupInput,
    client: PrismaDeliveryFeeAdjustmentsClient = this.prisma,
  ) {
    const where = this.buildDeliveryLookupWhere(lookup);

    return client.business_order_delivery.findFirst({
      where,
      include: {
        business_order: true,
      },
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

  private ensureDeliveryAllowsFeeAdjustment(
    deliveryStatus: business_order_delivery_delivery_status,
  ): void {
    if (
      deliveryStatus === business_order_delivery_delivery_status.cancelled ||
      deliveryStatus === business_order_delivery_delivery_status.delivery_failed
    ) {
      throw new ConflictException(
        `Delivery status ${deliveryStatus} does not allow fee adjustments.`,
      );
    }
  }

  private ensureValidResolutionTransition(
    currentStatus: business_order_delivery_fee_adjustment_adjustment_status,
    nextStatus: business_order_delivery_fee_adjustment_adjustment_status,
  ): void {
    if (currentStatus === nextStatus) {
      return;
    }

    switch (currentStatus) {
      case business_order_delivery_fee_adjustment_adjustment_status.requested:
        if (
          nextStatus ===
            business_order_delivery_fee_adjustment_adjustment_status.approved ||
          nextStatus ===
            business_order_delivery_fee_adjustment_adjustment_status.rejected ||
          nextStatus ===
            business_order_delivery_fee_adjustment_adjustment_status.cancelled ||
          nextStatus ===
            business_order_delivery_fee_adjustment_adjustment_status.applied
        ) {
          return;
        }
        break;
      case business_order_delivery_fee_adjustment_adjustment_status.approved:
        if (
          nextStatus ===
            business_order_delivery_fee_adjustment_adjustment_status.applied ||
          nextStatus ===
            business_order_delivery_fee_adjustment_adjustment_status.cancelled
        ) {
          return;
        }
        break;
      case business_order_delivery_fee_adjustment_adjustment_status.rejected:
      case business_order_delivery_fee_adjustment_adjustment_status.applied:
      case business_order_delivery_fee_adjustment_adjustment_status.cancelled:
        break;
      default:
        break;
    }

    throw new ConflictException(
      `Fee adjustment transition ${currentStatus} -> ${nextStatus} is not allowed.`,
    );
  }

  private resolveApprovedExtraFee(
    existingAdjustment: BusinessOrderDeliveryFeeAdjustmentRecord,
    dto: ResolveDeliveryFeeAdjustmentDto,
  ): Prisma.Decimal | undefined {
    const isApprovalLikeStatus =
      dto.adjustmentStatus ===
        business_order_delivery_fee_adjustment_adjustment_status.approved ||
      dto.adjustmentStatus ===
        business_order_delivery_fee_adjustment_adjustment_status.applied;

    if (!isApprovalLikeStatus) {
      if (dto.approvedExtraFee !== undefined) {
        throw new BadRequestException(
          'approvedExtraFee can only be sent when the adjustment is approved or applied.',
        );
      }

      return undefined;
    }

    const approvedExtraFeeValue =
      dto.approvedExtraFee ??
      (existingAdjustment.approved_extra_fee !== null
        ? Number(existingAdjustment.approved_extra_fee)
        : undefined);

    if (approvedExtraFeeValue === undefined) {
      throw new BadRequestException(
        'approvedExtraFee is required when the adjustment is approved or applied.',
      );
    }

    if (approvedExtraFeeValue < 0) {
      throw new BadRequestException('approvedExtraFee cannot be negative.');
    }

    return new Prisma.Decimal(approvedExtraFeeValue);
  }
}
