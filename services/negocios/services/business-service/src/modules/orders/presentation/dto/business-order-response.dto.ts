import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  business_order_cancelled_by,
  business_order_financial_status_snapshot,
  business_order_order_status,
  business_order_penalty_type_snapshot,
  business_order_status_history_new_status,
  business_order_status_history_previous_status,
  business_order_status_history_status_origin,
  inventory_reservation_reservation_status,
} from '@prisma/client';

export class BusinessOrderReservationSummaryDto {
  @ApiProperty()
  inventoryReservationId!: number;

  @ApiProperty()
  reservationCode!: string;

  @ApiProperty({
    enum: inventory_reservation_reservation_status,
    enumName: 'inventory_reservation_reservation_status',
  })
  reservationStatus!: inventory_reservation_reservation_status;

  @ApiProperty()
  expiresAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  confirmedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  releasedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  releaseReason!: string | null;
}

export class BusinessOrderDetailResponseDto {
  @ApiProperty()
  businessOrderDetailId!: number;

  @ApiProperty()
  productId!: number;

  @ApiProperty()
  productTypeId!: number;

  @ApiProperty()
  productNameSnapshot!: string;

  @ApiPropertyOptional({ nullable: true })
  productDescriptionSnapshot!: string | null;

  @ApiProperty()
  productTypeNameSnapshot!: string;

  @ApiProperty({ example: 25.5 })
  baseUnitPriceSnapshot!: number;

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ example: 51.0 })
  baseSubtotalSnapshot!: number;

  @ApiProperty()
  hasPromotionSnapshot!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class BusinessOrderStatusHistoryResponseDto {
  @ApiProperty()
  businessOrderStatusHistoryId!: number;

  @ApiPropertyOptional({
    enum: business_order_status_history_previous_status,
    enumName: 'business_order_status_history_previous_status',
    nullable: true,
  })
  previousStatus!: business_order_status_history_previous_status | null;

  @ApiProperty({
    enum: business_order_status_history_new_status,
    enumName: 'business_order_status_history_new_status',
  })
  newStatus!: business_order_status_history_new_status;

  @ApiProperty({
    enum: business_order_status_history_status_origin,
    enumName: 'business_order_status_history_status_origin',
  })
  statusOrigin!: business_order_status_history_status_origin;

  @ApiPropertyOptional({ nullable: true })
  observation!: string | null;

  @ApiProperty()
  createdAt!: Date;
}

export class BusinessOrderResponseDto {
  @ApiProperty()
  businessOrderId!: number;

  @ApiProperty()
  externalOrderCode!: string;

  @ApiProperty()
  businessId!: number;

  @ApiProperty()
  externalCustomerId!: number;

  @ApiPropertyOptional({ nullable: true })
  externalPaymentCode!: string | null;

  @ApiProperty({
    enum: business_order_order_status,
    enumName: 'business_order_order_status',
  })
  orderStatus!: business_order_order_status;

  @ApiProperty({
    enum: business_order_financial_status_snapshot,
    enumName: 'business_order_financial_status_snapshot',
  })
  financialStatusSnapshot!: business_order_financial_status_snapshot;

  @ApiProperty({ example: 100.0 })
  baseSubtotalSnapshot!: number;

  @ApiProperty({ example: 5.0 })
  totalDiscountAmountSnapshot!: number;

  @ApiProperty({ example: 10.0 })
  serviceFeeAmountSnapshot!: number;

  @ApiProperty({ example: 5.0 })
  tipAmountSnapshot!: number;

  @ApiProperty({ example: 110.0 })
  totalPaidAmountSnapshot!: number;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional({ nullable: true })
  paymentApprovedAt!: Date | null;

  @ApiPropertyOptional({
    enum: business_order_cancelled_by,
    enumName: 'business_order_cancelled_by',
    nullable: true,
  })
  cancelledBy!: business_order_cancelled_by | null;

  @ApiPropertyOptional({ nullable: true })
  cancellationReason!: string | null;

  @ApiProperty()
  penaltyApplied!: boolean;

  @ApiPropertyOptional({
    enum: business_order_penalty_type_snapshot,
    enumName: 'business_order_penalty_type_snapshot',
    nullable: true,
  })
  penaltyTypeSnapshot!: business_order_penalty_type_snapshot | null;

  @ApiPropertyOptional({ example: 10.0, nullable: true })
  penaltyValueSnapshot!: number | null;

  @ApiPropertyOptional({ example: 12.5, nullable: true })
  penaltyAmountSnapshot!: number | null;

  @ApiProperty({ type: [BusinessOrderDetailResponseDto] })
  details!: BusinessOrderDetailResponseDto[];

  @ApiProperty({ type: [BusinessOrderStatusHistoryResponseDto] })
  statusHistory!: BusinessOrderStatusHistoryResponseDto[];

  @ApiPropertyOptional({
    type: BusinessOrderReservationSummaryDto,
    nullable: true,
  })
  reservation!: BusinessOrderReservationSummaryDto | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class CancellationPenaltyEvaluationResponseDto {
  @ApiProperty()
  externalOrderCode!: string;

  @ApiProperty({
    enum: business_order_order_status,
    enumName: 'business_order_order_status',
  })
  orderStatus!: business_order_order_status;

  @ApiProperty()
  appliesPenalty!: boolean;

  @ApiProperty({ example: true })
  cancellable!: boolean;

  @ApiPropertyOptional({ nullable: true })
  reason!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 'percentage' })
  penaltyType!: string | null;

  @ApiPropertyOptional({ nullable: true, example: 10.0 })
  penaltyValue!: number | null;

  @ApiPropertyOptional({ nullable: true, example: 12.5 })
  penaltyAmount!: number | null;

  @ApiPropertyOptional({ nullable: true })
  ruleDescription!: string | null;
}
