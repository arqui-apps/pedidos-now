import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_order_financial_status_snapshot } from '@prisma/client';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBusinessOrderDetailDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateBusinessOrderDto {
  @ApiProperty({ maxLength: 64, example: 'ORD-10001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  externalOrderCode!: string;

  @ApiProperty({ maxLength: 64, example: 'RSV-10001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  reservationCode!: string;

  @ApiProperty({ example: 99 })
  @IsInt()
  @Min(1)
  externalCustomerId!: number;

  @ApiPropertyOptional({ maxLength: 64, example: 'PAY-10001' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  externalPaymentCode?: string;

  @ApiProperty({ example: '2026-04-12T20:00:00Z' })
  @IsDateString()
  reservationExpiresAt!: string;

  @ApiPropertyOptional({
    enum: business_order_financial_status_snapshot,
    enumName: 'business_order_financial_status_snapshot',
    default: business_order_financial_status_snapshot.pending,
  })
  @IsOptional()
  @IsEnum(business_order_financial_status_snapshot)
  financialStatusSnapshot?: business_order_financial_status_snapshot;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @IsString()
  serviceFeeAmount?: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @IsString()
  totalDiscountAmount?: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @IsString()
  tipAmount?: string;

  @ApiPropertyOptional({ example: '150.00' })
  @IsOptional()
  @IsString()
  totalPaidAmount?: string;

  @ApiPropertyOptional({ maxLength: 3, default: 'gtq' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: '2026-04-12T20:10:00Z' })
  @IsOptional()
  @IsDateString()
  paymentApprovedAt?: string;

  @ApiProperty({ type: [CreateBusinessOrderDetailDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateBusinessOrderDetailDto)
  details!: CreateBusinessOrderDetailDto[];
}
