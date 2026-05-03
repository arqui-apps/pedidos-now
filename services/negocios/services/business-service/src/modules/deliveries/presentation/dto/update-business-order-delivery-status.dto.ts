import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import {
  business_order_delivery_delivery_status,
  business_order_delivery_status_history_status_origin,
} from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBusinessOrderDeliveryStatusDto {
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

  @ApiProperty({
    enum: business_order_delivery_delivery_status,
    enumName: 'business_order_delivery_delivery_status',
    example: business_order_delivery_delivery_status.courier_assigned,
  })
  @IsEnum(business_order_delivery_delivery_status)
  newStatus!: business_order_delivery_delivery_status;

  @ApiProperty({
    enum: business_order_delivery_status_history_status_origin,
    enumName: 'business_order_delivery_status_history_status_origin',
    example: business_order_delivery_status_history_status_origin.couriers,
  })
  @IsEnum(business_order_delivery_status_history_status_origin)
  statusOrigin!: business_order_delivery_status_history_status_origin;

  @ApiPropertyOptional({ example: 'Courier asignado por Logistica.' })
  @IsOptional()
  @IsString()
  observation?: string;

  @ApiPropertyOptional({ example: 27, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  externalCourierId?: number;
}
