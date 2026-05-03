import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  business_order_delivery_delivery_status,
  business_order_delivery_delivery_type,
  business_order_delivery_status_history_new_status,
  business_order_delivery_status_history_previous_status,
  business_order_delivery_status_history_status_origin,
  business_order_order_status,
} from '@prisma/client';

export class BusinessOrderDeliveryStatusHistoryResponseDto {
  @ApiProperty()
  businessOrderDeliveryStatusHistoryId!: number;

  @ApiPropertyOptional({
    enum: business_order_delivery_status_history_previous_status,
    enumName: 'business_order_delivery_status_history_previous_status',
    nullable: true,
  })
  previousStatus!: business_order_delivery_status_history_previous_status | null;

  @ApiProperty({
    enum: business_order_delivery_status_history_new_status,
    enumName: 'business_order_delivery_status_history_new_status',
  })
  newStatus!: business_order_delivery_status_history_new_status;

  @ApiProperty({
    enum: business_order_delivery_status_history_status_origin,
    enumName: 'business_order_delivery_status_history_status_origin',
  })
  statusOrigin!: business_order_delivery_status_history_status_origin;

  @ApiPropertyOptional({ nullable: true })
  observation!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class BusinessOrderDeliveryResponseDto {
  @ApiProperty()
  businessOrderDeliveryId!: number;

  @ApiProperty()
  businessOrderId!: number;

  @ApiProperty()
  externalOrderCode!: string;

  @ApiProperty()
  branchId!: number;

  @ApiPropertyOptional({ nullable: true })
  externalDeliveryCode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  externalLogisticsOrderCode!: string | null;

  @ApiProperty({
    enum: business_order_order_status,
    enumName: 'business_order_order_status',
  })
  orderStatus!: business_order_order_status;

  @ApiProperty({
    enum: business_order_delivery_delivery_type,
    enumName: 'business_order_delivery_delivery_type',
  })
  deliveryType!: business_order_delivery_delivery_type;

  @ApiProperty({
    enum: business_order_delivery_delivery_status,
    enumName: 'business_order_delivery_delivery_status',
  })
  deliveryStatus!: business_order_delivery_delivery_status;

  @ApiPropertyOptional({ nullable: true })
  externalCourierId!: number | null;

  @ApiPropertyOptional({ nullable: true })
  recipientNameSnapshot!: string | null;

  @ApiPropertyOptional({ nullable: true })
  recipientPhoneSnapshot!: string | null;

  @ApiPropertyOptional({ nullable: true })
  deliveryAddressSnapshot!: string | null;

  @ApiPropertyOptional({ nullable: true })
  deliveryReferenceSnapshot!: string | null;

  @ApiPropertyOptional({ nullable: true })
  deliveryNotesSnapshot!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 4.5 })
  estimatedDistanceKm!: number | null;

  @ApiPropertyOptional({ nullable: true })
  estimatedTravelMinutes!: number | null;

  @ApiProperty({ example: 20.0 })
  baseDeliveryFeeSnapshot!: number;

  @ApiProperty({ example: 20.0 })
  finalDeliveryFeeSnapshot!: number;

  @ApiProperty()
  hasFeeAdjustment!: boolean;

  @ApiPropertyOptional({ nullable: true })
  assignedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  pickedUpAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  deliveredAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  cancelledAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({
    type: BusinessOrderDeliveryStatusHistoryResponseDto,
    isArray: true,
  })
  statusHistory!: BusinessOrderDeliveryStatusHistoryResponseDto[];
}
