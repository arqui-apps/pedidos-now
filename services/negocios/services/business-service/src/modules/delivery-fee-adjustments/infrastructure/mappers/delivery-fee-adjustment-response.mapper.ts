import { DeliveryFeeAdjustmentResponseDto } from '../../presentation/dto/delivery-fee-adjustment-response.dto';
import { BusinessOrderDeliveryFeeAdjustmentRecord } from '../repositories/delivery-fee-adjustments.repository';

export function mapDeliveryFeeAdjustmentToResponseDto(
  record: BusinessOrderDeliveryFeeAdjustmentRecord,
): DeliveryFeeAdjustmentResponseDto {
  return {
    businessOrderDeliveryFeeAdjustmentId:
      record.business_order_delivery_fee_adjustment_id,
    businessOrderDeliveryId: record.business_order_delivery_id,
    businessOrderId: record.business_order_delivery.business_order_id,
    externalOrderCode:
      record.business_order_delivery.business_order.external_order_code,
    externalDeliveryCode: record.business_order_delivery.external_delivery_code,
    externalLogisticsOrderCode:
      record.business_order_delivery.external_logistics_order_code,
    deliveryStatus: record.business_order_delivery.delivery_status,
    externalCourierId: record.external_courier_id,
    requestedExtraFee: Number(record.requested_extra_fee),
    approvedExtraFee:
      record.approved_extra_fee !== null
        ? Number(record.approved_extra_fee)
        : null,
    adjustmentStatus: record.adjustment_status,
    reasonType: record.reason_type,
    reasonDetail: record.reason_detail,
    deliveryBaseFeeSnapshot: Number(
      record.business_order_delivery.base_delivery_fee_snapshot,
    ),
    deliveryFinalFeeSnapshot: Number(
      record.business_order_delivery.final_delivery_fee_snapshot,
    ),
    hasFeeAdjustment: Boolean(
      record.business_order_delivery.has_fee_adjustment,
    ),
    requestedAt: record.requested_at,
    resolvedAt: record.resolved_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}
