import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_order_delivery_fee_adjustment_adjustment_status } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class ResolveDeliveryFeeAdjustmentDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  businessOrderDeliveryFeeAdjustmentId!: number;

  @ApiProperty({
    enum: business_order_delivery_fee_adjustment_adjustment_status,
    enumName: 'business_order_delivery_fee_adjustment_adjustment_status',
    example: business_order_delivery_fee_adjustment_adjustment_status.approved,
  })
  @IsEnum(business_order_delivery_fee_adjustment_adjustment_status)
  adjustmentStatus!: business_order_delivery_fee_adjustment_adjustment_status;

  @ApiPropertyOptional({ example: 5.0, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  approvedExtraFee?: number;
}
