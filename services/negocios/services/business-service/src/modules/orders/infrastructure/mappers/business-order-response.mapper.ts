import {
  BusinessOrderResponseDto,
  CancellationPenaltyEvaluationResponseDto,
} from '../../presentation/dto/business-order-response.dto';
import { BusinessOrderRecord } from '../repositories/prisma-orders.repository';

export function mapBusinessOrderToResponseDto(
  record: BusinessOrderRecord,
): BusinessOrderResponseDto {
  return {
    businessOrderId: record.business_order_id,
    externalOrderCode: record.external_order_code,
    businessId: record.business_id,
    externalCustomerId: record.external_customer_id,
    externalPaymentCode: record.external_payment_code,
    orderStatus: record.order_status,
    financialStatusSnapshot: record.financial_status_snapshot,
    baseSubtotalSnapshot: Number(record.base_subtotal_snapshot),
    totalDiscountAmountSnapshot: Number(record.total_discount_amount_snapshot),
    serviceFeeAmountSnapshot: Number(record.service_fee_amount_snapshot),
    tipAmountSnapshot: Number(record.tip_amount_snapshot),
    totalPaidAmountSnapshot: Number(record.total_paid_amount_snapshot),
    currency: record.currency,
    paymentApprovedAt: record.payment_approved_at,
    cancelledBy: record.cancelled_by,
    cancellationReason: record.cancellation_reason,
    penaltyApplied: record.penalty_applied === 1,
    penaltyTypeSnapshot: record.penalty_type_snapshot,
    penaltyValueSnapshot:
      record.penalty_value_snapshot !== null
        ? Number(record.penalty_value_snapshot)
        : null,
    penaltyAmountSnapshot:
      record.penalty_amount_snapshot !== null
        ? Number(record.penalty_amount_snapshot)
        : null,
    details: record.business_order_detail.map((detail) => ({
      businessOrderDetailId: detail.business_order_detail_id,
      productId: detail.product_id,
      productTypeId: detail.product_type_id,
      productNameSnapshot: detail.product_name_snapshot,
      productDescriptionSnapshot: detail.product_description_snapshot,
      productTypeNameSnapshot: detail.product_type_name_snapshot,
      baseUnitPriceSnapshot: Number(detail.base_unit_price_snapshot),
      quantity: detail.quantity,
      baseSubtotalSnapshot: Number(detail.base_subtotal_snapshot),
      hasPromotionSnapshot: detail.has_promotion_snapshot === 1,
      createdAt: detail.created_at,
      updatedAt: detail.updated_at,
    })),
    statusHistory: record.business_order_status_history.map((history) => ({
      businessOrderStatusHistoryId: history.business_order_status_history_id,
      previousStatus: history.previous_status,
      newStatus: history.new_status,
      statusOrigin: history.status_origin,
      observation: history.observation,
      createdAt: history.created_at,
    })),
    reservation: record.inventory_reservation
      ? {
          inventoryReservationId:
            record.inventory_reservation.inventory_reservation_id,
          reservationCode: record.inventory_reservation.reservation_code,
          reservationStatus: record.inventory_reservation.reservation_status,
          expiresAt: record.inventory_reservation.expires_at,
          confirmedAt: record.inventory_reservation.confirmed_at,
          releasedAt: record.inventory_reservation.released_at,
          releaseReason: record.inventory_reservation.release_reason,
        }
      : null,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapCancellationPenaltyEvaluationToResponseDto(data: {
  externalOrderCode: string;
  orderStatus: BusinessOrderRecord['order_status'];
  appliesPenalty: boolean;
  cancellable: boolean;
  reason: string | null;
  penaltyType: string | null;
  penaltyValue: number | null;
  penaltyAmount: number | null;
  ruleDescription: string | null;
}): CancellationPenaltyEvaluationResponseDto {
  return {
    externalOrderCode: data.externalOrderCode,
    orderStatus: data.orderStatus,
    appliesPenalty: data.appliesPenalty,
    cancellable: data.cancellable,
    reason: data.reason,
    penaltyType: data.penaltyType,
    penaltyValue: data.penaltyValue,
    penaltyAmount: data.penaltyAmount,
    ruleDescription: data.ruleDescription,
  };
}
