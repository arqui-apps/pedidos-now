import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_order_financial_status_snapshot } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ConfirmBusinessOrderDto {
  @ApiProperty({ maxLength: 64, example: 'ORD-10001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  externalOrderCode!: string;

  @ApiPropertyOptional({
    enum: business_order_financial_status_snapshot,
    enumName: 'business_order_financial_status_snapshot',
  })
  @IsOptional()
  @IsEnum(business_order_financial_status_snapshot)
  financialStatusSnapshot?: business_order_financial_status_snapshot;

  @ApiPropertyOptional({ example: '2026-04-15T18:30:00Z' })
  @IsOptional()
  @IsDateString()
  paymentApprovedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observation?: string;
}
