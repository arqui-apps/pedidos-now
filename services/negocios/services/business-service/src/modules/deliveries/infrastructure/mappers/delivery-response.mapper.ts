import { BusinessOrderDeliveryResponseDto } from '../../presentation/dto/business-order-delivery-response.dto';
import { BusinessOrderDeliveryRecord } from '../repositories/deliveries.repository';

export function mapDeliveryToResponseDto(
  record: BusinessOrderDeliveryRecord,
): BusinessOrderDeliveryResponseDto {
  return {
    businessOrderDeliveryId: record.business_order_delivery_id,
    businessOrderId: record.business_order_id,
    externalOrderCode: record.business_order.external_order_code,
    branchId: record.branch_id,
    externalDeliveryCode: record.external_delivery_code,
    externalLogisticsOrderCode: record.external_logistics_order_code,
    orderStatus: record.business_order.order_status,
    deliveryType: record.delivery_type,
    deliveryStatus: record.delivery_status,
    externalCourierId: record.external_courier_id,
    recipientNameSnapshot: record.recipient_name_snapshot,
    recipientPhoneSnapshot: record.recipient_phone_snapshot,
    deliveryAddressSnapshot: record.delivery_address_snapshot,
    deliveryReferenceSnapshot: record.delivery_reference_snapshot,
    deliveryNotesSnapshot: record.delivery_notes_snapshot,
    estimatedDistanceKm:
      record.estimated_distance_km !== null
        ? Number(record.estimated_distance_km)
        : null,
    estimatedTravelMinutes: record.estimated_travel_minutes,
    baseDeliveryFeeSnapshot: Number(record.base_delivery_fee_snapshot),
    finalDeliveryFeeSnapshot: Number(record.final_delivery_fee_snapshot),
    hasFeeAdjustment: record.has_fee_adjustment === 1,
    assignedAt: record.assigned_at,
    pickedUpAt: record.picked_up_at,
    deliveredAt: record.delivered_at,
    cancelledAt: record.cancelled_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    statusHistory: record.business_order_delivery_status_history.map(
      (history) => ({
        businessOrderDeliveryStatusHistoryId:
          history.business_order_delivery_status_history_id,
        previousStatus: history.previous_status,
        newStatus: history.new_status,
        statusOrigin: history.status_origin,
        observation: history.observation,
        createdAt: history.created_at,
      }),
    ),
  };
}
