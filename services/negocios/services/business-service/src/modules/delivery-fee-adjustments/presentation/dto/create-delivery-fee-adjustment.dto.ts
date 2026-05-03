import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_order_delivery_fee_adjustment_reason_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateDeliveryFeeAdjustmentDto {
  @ApiPropertyOptional({ example: 'ORD-10001' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  externalOrderCode?: string;

  @ApiPropertyOptional({ example: 'DEL-10001' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  externalDeliveryCode?: string;

  @ApiPropertyOptional({ example: 'LOG-ORD-10001' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  externalLogisticsOrderCode?: string;

  @ApiProperty({ example: 7.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  requestedExtraFee!: number;

  @ApiProperty({
    enum: business_order_delivery_fee_adjustment_reason_type,
    enumName: 'business_order_delivery_fee_adjustment_reason_type',
    example: business_order_delivery_fee_adjustment_reason_type.heavy_traffic,
  })
  @IsEnum(business_order_delivery_fee_adjustment_reason_type)
  reasonType!: business_order_delivery_fee_adjustment_reason_type;

  @ApiPropertyOptional({ example: 'Traffic accident forced a longer route.' })
  @IsOptional()
  @IsString()
  reasonDetail?: string;

  @ApiPropertyOptional({ example: 27, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  externalCourierId?: number;
}
