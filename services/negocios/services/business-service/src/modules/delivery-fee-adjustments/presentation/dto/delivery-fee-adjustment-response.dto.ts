import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  business_order_delivery_delivery_status,
  business_order_delivery_fee_adjustment_adjustment_status,
  business_order_delivery_fee_adjustment_reason_type,
} from '@prisma/client';

export class DeliveryFeeAdjustmentResponseDto {
  @ApiProperty()
  businessOrderDeliveryFeeAdjustmentId!: number;

  @ApiProperty()
  businessOrderDeliveryId!: number;

  @ApiProperty()
  businessOrderId!: number;

  @ApiProperty()
  externalOrderCode!: string;

  @ApiPropertyOptional({ nullable: true })
  externalDeliveryCode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  externalLogisticsOrderCode!: string | null;

  @ApiProperty({
    enum: business_order_delivery_delivery_status,
    enumName: 'business_order_delivery_delivery_status',
  })
  deliveryStatus!: business_order_delivery_delivery_status;

  @ApiPropertyOptional({ nullable: true })
  externalCourierId!: number | null;

  @ApiProperty({ example: 7.5 })
  requestedExtraFee!: number;

  @ApiPropertyOptional({ nullable: true, example: 5.0 })
  approvedExtraFee!: number | null;

  @ApiProperty({
    enum: business_order_delivery_fee_adjustment_adjustment_status,
    enumName: 'business_order_delivery_fee_adjustment_adjustment_status',
  })
  adjustmentStatus!: business_order_delivery_fee_adjustment_adjustment_status;

  @ApiProperty({
    enum: business_order_delivery_fee_adjustment_reason_type,
    enumName: 'business_order_delivery_fee_adjustment_reason_type',
  })
  reasonType!: business_order_delivery_fee_adjustment_reason_type;

  @ApiPropertyOptional({ nullable: true })
  reasonDetail!: string | null;

  @ApiProperty({ example: 20.0 })
  deliveryBaseFeeSnapshot!: number;

  @ApiProperty({ example: 25.0 })
  deliveryFinalFeeSnapshot!: number;

  @ApiProperty()
  hasFeeAdjustment!: boolean;

  @ApiProperty()
  requestedAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  resolvedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
