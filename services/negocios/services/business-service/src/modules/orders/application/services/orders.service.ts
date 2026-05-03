import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  business_order_cancelled_by,
  business_order_financial_status_snapshot,
  business_order_order_status,
  business_order_penalty_type_snapshot,
  business_order_status_history_new_status,
  business_order_status_history_status_origin,
  cancellation_penalty_rule_applicable_order_status,
  cancellation_penalty_rule_penalty_type,
  inventory_reservation_reservation_status,
} from '@prisma/client';
import { InventoryService } from '../../../inventory/application/services/inventory.service';
import {
  mapBusinessOrderToResponseDto,
  mapCancellationPenaltyEvaluationToResponseDto,
} from '../../infrastructure/mappers/business-order-response.mapper';
import {
  BusinessOrderResponseDto,
  CancellationPenaltyEvaluationResponseDto,
} from '../../presentation/dto/business-order-response.dto';
import { CancelBusinessOrderDto } from '../../presentation/dto/cancel-business-order.dto';
import { ConfirmBusinessOrderDto } from '../../presentation/dto/confirm-business-order.dto';
import {
  CreateBusinessOrderDetailDto,
  CreateBusinessOrderDto,
} from '../../presentation/dto/create-business-order.dto';
import { EvaluateCancellationPenaltyDto } from '../../presentation/dto/evaluate-cancellation-penalty.dto';
import { ListBusinessOrdersQueryDto } from '../../presentation/dto/list-business-orders-query.dto';
import { UpdateBusinessOrderStatusDto } from '../../presentation/dto/update-business-order-status.dto';
import {
  BusinessOrderRecord,
  PrismaOrdersRepository,
} from '../../infrastructure/repositories/prisma-orders.repository';

type CancellationPenaltyEvaluation = {
  appliesPenalty: boolean;
  cancellable: boolean;
  reason: string | null;
  penaltyType: cancellation_penalty_rule_penalty_type | null;
  penaltyValue: number | null;
  penaltyAmount: number | null;
  ruleDescription: string | null;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: PrismaOrdersRepository,
    private readonly inventoryService: InventoryService,
  ) {}

  async create(
    businessId: number,
    dto: CreateBusinessOrderDto,
  ): Promise<BusinessOrderResponseDto> {
    await this.ensureBusinessExists(businessId);
    this.ensureUniqueProductDetails(dto.details);

    const products = await this.ordersRepository.findProductsByIds(
      businessId,
      dto.details.map((detail) => detail.productId),
    );

    if (products.length !== dto.details.length) {
      throw new NotFoundException(
        'One or more products were not found or are not available for this business.',
      );
    }

    const productMap = new Map(
      products.map((product) => [product.product_id, product]),
    );

    const detailRows = dto.details.map((detail) => {
      const product = productMap.get(detail.productId);

      if (!product) {
        throw new NotFoundException(
          `Product ${detail.productId} was not found for business ${businessId}.`,
        );
      }

      const baseUnitPrice = Number(product.base_price);
      const baseSubtotal = baseUnitPrice * detail.quantity;

      return {
        product_id: product.product_id,
        product_type_id: product.product_type_id,
        business_promotion_reference_id: null,
        product_name_snapshot: product.name,
        product_description_snapshot: product.description,
        product_type_name_snapshot: product.product_type.name,
        base_unit_price_snapshot: baseUnitPrice.toFixed(2),
        quantity: detail.quantity,
        base_subtotal_snapshot: baseSubtotal.toFixed(2),
        has_promotion_snapshot: 0,
      };
    });

    const baseSubtotal = detailRows.reduce(
      (sum, detail) => sum + Number(detail.base_subtotal_snapshot),
      0,
    );
    const totalDiscountAmount = this.toMoneyNumber(dto.totalDiscountAmount, 0);
    const serviceFeeAmount = this.toMoneyNumber(dto.serviceFeeAmount, 0);
    const tipAmount = this.toMoneyNumber(dto.tipAmount, 0);
    const computedTotalPaidAmount =
      baseSubtotal - totalDiscountAmount + serviceFeeAmount + tipAmount;
    const totalPaidAmount = this.toMoneyNumber(
      dto.totalPaidAmount,
      computedTotalPaidAmount,
    );

    let reservation:
      | {
          inventory_reservation_id: number;
          reservation_code: string;
        }
      | undefined;

    try {
      reservation = await this.inventoryService.validateAndReserve({
        reservationCode: dto.reservationCode,
        businessId,
        externalCustomerId: dto.externalCustomerId,
        expiresAt: dto.reservationExpiresAt,
        details: detailRows.map((detail) => ({
          productId: detail.product_id,
          quantity: detail.quantity,
          baseUnitPrice: detail.base_unit_price_snapshot,
          baseSubtotal: detail.base_subtotal_snapshot,
        })),
      });

      const created = await this.ordersRepository.create(
        {
          external_order_code: dto.externalOrderCode,
          business_id: businessId,
          external_customer_id: dto.externalCustomerId,
          inventory_reservation_id: reservation.inventory_reservation_id,
          external_payment_code: dto.externalPaymentCode,
          order_status: business_order_order_status.reserved,
          financial_status_snapshot:
            dto.financialStatusSnapshot ??
            business_order_financial_status_snapshot.pending,
          base_subtotal_snapshot: baseSubtotal.toFixed(2),
          total_discount_amount_snapshot: totalDiscountAmount.toFixed(2),
          service_fee_amount_snapshot: serviceFeeAmount.toFixed(2),
          tip_amount_snapshot: tipAmount.toFixed(2),
          total_paid_amount_snapshot: totalPaidAmount.toFixed(2),
          currency: (dto.currency ?? 'gtq').toLowerCase(),
          payment_approved_at: dto.paymentApprovedAt
            ? new Date(dto.paymentApprovedAt)
            : null,
          updated_at: new Date(),
        },
        detailRows,
        'Order created and stock reserved.',
      );

      return mapBusinessOrderToResponseDto(created);
    } catch (error) {
      if (reservation?.reservation_code) {
        try {
          await this.inventoryService.releaseReservation({
            reservationCode: reservation.reservation_code,
            reason: 'Reservation released due to order creation rollback.',
          });
        } catch {
          // Intentionally ignored to preserve the original error.
        }
      }

      this.handlePrismaWriteError(error);
    }
  }

  async list(
    businessId: number,
    query: ListBusinessOrdersQueryDto,
  ): Promise<BusinessOrderResponseDto[]> {
    await this.ensureBusinessExists(businessId);

    const records = await this.ordersRepository.findAll(businessId, query);
    return records.map((record) => mapBusinessOrderToResponseDto(record));
  }

  async getById(
    businessId: number,
    businessOrderId: number,
  ): Promise<BusinessOrderResponseDto> {
    const record = await this.getOrderByBusinessAndId(
      businessId,
      businessOrderId,
    );
    return mapBusinessOrderToResponseDto(record);
  }

  async getByExternalOrderCode(
    externalOrderCode: string,
  ): Promise<BusinessOrderResponseDto> {
    const order = await this.getOrderByExternalOrderCode(externalOrderCode);
    return mapBusinessOrderToResponseDto(order);
  }

  async confirm(
    dto: ConfirmBusinessOrderDto,
  ): Promise<BusinessOrderResponseDto> {
    const order = await this.getOrderByExternalOrderCode(dto.externalOrderCode);

    if (this.isCancelledStatus(order.order_status)) {
      throw new ConflictException('Cancelled orders cannot be confirmed.');
    }

    if (order.order_status !== business_order_order_status.reserved) {
      throw new ConflictException(
        `Only reserved orders can be confirmed. Current status: ${order.order_status}.`,
      );
    }

    if (!order.inventory_reservation?.reservation_code) {
      throw new ConflictException(
        'The order does not have an associated inventory reservation to confirm.',
      );
    }

    if (
      order.inventory_reservation.reservation_status ===
      inventory_reservation_reservation_status.active
    ) {
      await this.inventoryService.confirmReservation({
        reservationCode: order.inventory_reservation.reservation_code,
      });
    } else if (
      order.inventory_reservation.reservation_status !==
      inventory_reservation_reservation_status.confirmed
    ) {
      throw new ConflictException(
        `The associated reservation cannot be confirmed from status ${order.inventory_reservation.reservation_status}.`,
      );
    }

    const updated = await this.ordersRepository.updateOrder(
      order.business_order_id,
      {
        order_status: business_order_order_status.confirmed,
        financial_status_snapshot: dto.financialStatusSnapshot,
        payment_approved_at: dto.paymentApprovedAt
          ? new Date(dto.paymentApprovedAt)
          : undefined,
        updated_at: new Date(),
      },
      {
        previous_status: order.order_status,
        new_status: business_order_status_history_new_status.confirmed,
        status_origin: business_order_status_history_status_origin.payments,
        observation:
          dto.observation ??
          'Business order confirmed and reservation consumed.',
      },
    );

    return mapBusinessOrderToResponseDto(updated);
  }

  async markPreparing(
    businessId: number,
    businessOrderId: number,
    dto: UpdateBusinessOrderStatusDto,
  ): Promise<BusinessOrderResponseDto> {
    const order = await this.getOrderByBusinessAndId(
      businessId,
      businessOrderId,
    );

    this.ensureTransitionAllowed(
      order.order_status,
      business_order_order_status.confirmed,
      'Only confirmed orders can move to preparing.',
    );

    const updated = await this.ordersRepository.updateOrder(
      order.business_order_id,
      {
        order_status: business_order_order_status.preparing,
        updated_at: new Date(),
      },
      {
        previous_status: order.order_status,
        new_status: business_order_status_history_new_status.preparing,
        status_origin: business_order_status_history_status_origin.business,
        observation:
          dto.observation ?? 'Business order moved to preparing status.',
      },
    );

    return mapBusinessOrderToResponseDto(updated);
  }

  async markReadyForPickup(
    businessId: number,
    businessOrderId: number,
    dto: UpdateBusinessOrderStatusDto,
  ): Promise<BusinessOrderResponseDto> {
    const order = await this.getOrderByBusinessAndId(
      businessId,
      businessOrderId,
    );

    this.ensureTransitionAllowed(
      order.order_status,
      business_order_order_status.preparing,
      'Only orders in preparing status can move to ready_for_pickup.',
    );

    const updated = await this.ordersRepository.updateOrder(
      order.business_order_id,
      {
        order_status: business_order_order_status.ready_for_pickup,
        updated_at: new Date(),
      },
      {
        previous_status: order.order_status,
        new_status: business_order_status_history_new_status.ready_for_pickup,
        status_origin: business_order_status_history_status_origin.business,
        observation: dto.observation ?? 'Business order is ready for pickup.',
      },
    );

    return mapBusinessOrderToResponseDto(updated);
  }

  async evaluateCancellationPenalty(
    dto: EvaluateCancellationPenaltyDto,
  ): Promise<CancellationPenaltyEvaluationResponseDto> {
    const order = await this.getOrderByExternalOrderCode(dto.externalOrderCode);
    const evaluation = await this.buildCancellationPenaltyEvaluation(order);

    return mapCancellationPenaltyEvaluationToResponseDto({
      externalOrderCode: order.external_order_code,
      orderStatus: order.order_status,
      appliesPenalty: evaluation.appliesPenalty,
      cancellable: evaluation.cancellable,
      reason: evaluation.reason,
      penaltyType: evaluation.penaltyType,
      penaltyValue: evaluation.penaltyValue,
      penaltyAmount: evaluation.penaltyAmount,
      ruleDescription: evaluation.ruleDescription,
    });
  }

  async cancel(dto: CancelBusinessOrderDto): Promise<BusinessOrderResponseDto> {
    const order = await this.getOrderByExternalOrderCode(dto.externalOrderCode);
    const evaluation = await this.buildCancellationPenaltyEvaluation(order);

    if (!evaluation.cancellable) {
      throw new ConflictException(
        evaluation.reason ??
          'This order cannot be cancelled in its current status.',
      );
    }

    const cancellationStatus = this.mapCancelledStatus(dto.cancelledBy);
    const historyOrigin = this.mapCancellationOrigin(dto.cancelledBy);

    if (order.inventory_reservation?.reservation_code) {
      if (
        order.inventory_reservation.reservation_status ===
        inventory_reservation_reservation_status.active
      ) {
        await this.inventoryService.releaseReservation({
          reservationCode: order.inventory_reservation.reservation_code,
          reason: dto.cancellationReason ?? 'Business order cancelled.',
        });
      }

      if (
        order.inventory_reservation.reservation_status ===
        inventory_reservation_reservation_status.confirmed
      ) {
        await this.inventoryService.cancelConfirmedReservation(
          order.inventory_reservation.reservation_code,
          dto.cancellationReason ?? 'Confirmed business order cancelled.',
        );
      }
    }

    const updated = await this.ordersRepository.updateOrder(
      order.business_order_id,
      {
        order_status: cancellationStatus,
        cancelled_by: dto.cancelledBy,
        cancellation_reason: dto.cancellationReason,
        penalty_applied: evaluation.appliesPenalty ? 1 : 0,
        penalty_type_snapshot:
          evaluation.penaltyType as business_order_penalty_type_snapshot | null,
        penalty_value_snapshot:
          evaluation.penaltyValue !== null
            ? evaluation.penaltyValue.toFixed(2)
            : null,
        penalty_amount_snapshot:
          evaluation.penaltyAmount !== null
            ? evaluation.penaltyAmount.toFixed(2)
            : null,
        updated_at: new Date(),
      },
      {
        previous_status: order.order_status,
        new_status: cancellationStatus,
        status_origin: historyOrigin,
        observation:
          dto.cancellationReason ??
          'Business order cancelled through internal flow.',
      },
    );

    return mapBusinessOrderToResponseDto(updated);
  }

  private async ensureBusinessExists(businessId: number) {
    const business = await this.ordersRepository.findBusinessById(businessId);

    if (!business) {
      throw new NotFoundException(`Business ${businessId} was not found.`);
    }

    return business;
  }

  private async getOrderByBusinessAndId(
    businessId: number,
    businessOrderId: number,
  ): Promise<BusinessOrderRecord> {
    await this.ensureBusinessExists(businessId);

    const record = await this.ordersRepository.findById(
      businessId,
      businessOrderId,
    );

    if (!record) {
      throw new NotFoundException(
        `Business order ${businessOrderId} was not found for business ${businessId}.`,
      );
    }

    return record;
  }

  private ensureUniqueProductDetails(details: CreateBusinessOrderDetailDto[]) {
    const seen = new Set<number>();

    for (const detail of details) {
      if (seen.has(detail.productId)) {
        throw new BadRequestException(
          `Product ${detail.productId} is duplicated in the order payload.`,
        );
      }

      seen.add(detail.productId);
    }
  }

  private async getOrderByExternalOrderCode(
    externalOrderCode: string,
  ): Promise<BusinessOrderRecord> {
    const order =
      await this.ordersRepository.findByExternalOrderCode(externalOrderCode);

    if (!order) {
      throw new NotFoundException(
        `Business order with external code ${externalOrderCode} was not found.`,
      );
    }

    return order;
  }

  private async buildCancellationPenaltyEvaluation(
    order: Pick<
      BusinessOrderRecord,
      | 'business_order_id'
      | 'external_order_code'
      | 'business_id'
      | 'order_status'
      | 'base_subtotal_snapshot'
      | 'total_paid_amount_snapshot'
    >,
  ): Promise<CancellationPenaltyEvaluation> {
    if (this.isCancelledStatus(order.order_status)) {
      return {
        appliesPenalty: false,
        cancellable: false,
        reason: 'The order is already cancelled.',
        penaltyType: null,
        penaltyValue: null,
        penaltyAmount: null,
        ruleDescription: null,
      };
    }

    if (order.order_status === business_order_order_status.delivered) {
      return {
        appliesPenalty: false,
        cancellable: false,
        reason: 'Delivered orders cannot be cancelled.',
        penaltyType: null,
        penaltyValue: null,
        penaltyAmount: null,
        ruleDescription: null,
      };
    }

    if (
      order.order_status === business_order_order_status.pending_validation ||
      order.order_status === business_order_order_status.reserved
    ) {
      return {
        appliesPenalty: false,
        cancellable: true,
        reason: null,
        penaltyType: null,
        penaltyValue: null,
        penaltyAmount: null,
        ruleDescription: null,
      };
    }

    const applicableStatus = this.mapOrderStatusToPenaltyStatus(
      order.order_status,
    );

    if (!applicableStatus) {
      return {
        appliesPenalty: false,
        cancellable: true,
        reason: null,
        penaltyType: null,
        penaltyValue: null,
        penaltyAmount: null,
        ruleDescription: null,
      };
    }

    const rule = await this.ordersRepository.findPenaltyRule(
      order.business_id,
      applicableStatus,
    );

    if (!rule) {
      return {
        appliesPenalty: false,
        cancellable: true,
        reason: null,
        penaltyType: null,
        penaltyValue: null,
        penaltyAmount: null,
        ruleDescription: null,
      };
    }

    const penaltyValue = Number(rule.penalty_value);
    const penaltyBase =
      Number(order.total_paid_amount_snapshot) > 0
        ? Number(order.total_paid_amount_snapshot)
        : Number(order.base_subtotal_snapshot);
    const penaltyAmount =
      rule.penalty_type === cancellation_penalty_rule_penalty_type.fixed_amount
        ? penaltyValue
        : Number(((penaltyBase * penaltyValue) / 100).toFixed(2));

    return {
      appliesPenalty: true,
      cancellable: true,
      reason: null,
      penaltyType: rule.penalty_type,
      penaltyValue,
      penaltyAmount,
      ruleDescription: rule.description,
    };
  }

  private mapOrderStatusToPenaltyStatus(
    orderStatus: business_order_order_status,
  ): cancellation_penalty_rule_applicable_order_status | null {
    switch (orderStatus) {
      case business_order_order_status.confirmed:
        return cancellation_penalty_rule_applicable_order_status.confirmed;
      case business_order_order_status.preparing:
        return cancellation_penalty_rule_applicable_order_status.preparing;
      case business_order_order_status.ready_for_pickup:
        return cancellation_penalty_rule_applicable_order_status.ready_for_pickup;
      case business_order_order_status.dispatched:
        return cancellation_penalty_rule_applicable_order_status.dispatched;
      default:
        return null;
    }
  }

  private mapCancelledStatus(
    cancelledBy: business_order_cancelled_by,
  ): business_order_order_status {
    switch (cancelledBy) {
      case business_order_cancelled_by.customer:
        return business_order_order_status.cancelled_by_customer;
      case business_order_cancelled_by.business:
        return business_order_order_status.cancelled_by_business;
      case business_order_cancelled_by.system:
        return business_order_order_status.cancelled_by_system;
      default:
        return business_order_order_status.cancelled_by_system;
    }
  }

  private mapCancellationOrigin(
    cancelledBy: business_order_cancelled_by,
  ): business_order_status_history_status_origin {
    switch (cancelledBy) {
      case business_order_cancelled_by.customer:
        return business_order_status_history_status_origin.customer_service;
      case business_order_cancelled_by.business:
        return business_order_status_history_status_origin.business;
      case business_order_cancelled_by.system:
        return business_order_status_history_status_origin.system;
      default:
        return business_order_status_history_status_origin.system;
    }
  }

  private isCancelledStatus(orderStatus: business_order_order_status): boolean {
    return (
      orderStatus === business_order_order_status.cancelled_by_customer ||
      orderStatus === business_order_order_status.cancelled_by_business ||
      orderStatus === business_order_order_status.cancelled_by_system
    );
  }

  private ensureTransitionAllowed(
    currentStatus: business_order_order_status,
    expectedCurrentStatus: business_order_order_status,
    message: string,
  ) {
    if (currentStatus !== expectedCurrentStatus) {
      throw new ConflictException(message);
    }
  }

  private toMoneyNumber(value: string | undefined, fallback: number): number {
    if (value === undefined) {
      return Number(fallback.toFixed(2));
    }

    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 0) {
      throw new BadRequestException(
        `Invalid monetary value received: ${value}.`,
      );
    }

    return Number(parsed.toFixed(2));
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
