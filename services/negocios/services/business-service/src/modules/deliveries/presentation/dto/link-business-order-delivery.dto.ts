import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { business_order_delivery_delivery_type } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class LinkBusinessOrderDeliveryDto {
  @ApiProperty({ example: 'ORD-10001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  externalOrderCode!: string;

  @ApiProperty({
    enum: business_order_delivery_delivery_type,
    enumName: 'business_order_delivery_delivery_type',
    example: business_order_delivery_delivery_type.home_delivery,
  })
  @IsEnum(business_order_delivery_delivery_type)
  deliveryType!: business_order_delivery_delivery_type;

  @ApiPropertyOptional({
    example: 0,
    description:
      'Sucursal lógica. Por acuerdo actual se maneja 0 si Logística la envía.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  branchId?: number;

  @ApiPropertyOptional({ example: 'DEL-10001', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  externalDeliveryCode?: string;

  @ApiPropertyOptional({ example: 'LOG-ORD-10001', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  externalLogisticsOrderCode?: string;

  @ApiPropertyOptional({ example: 27, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  externalCourierId?: number;

  @ApiPropertyOptional({ example: 'Juan Perez', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  recipientNameSnapshot?: string;

  @ApiPropertyOptional({ example: '5555-5555', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  recipientPhoneSnapshot?: string;

  @ApiPropertyOptional({
    example: '6a avenida 1-23 zona 1, Guatemala',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  deliveryAddressSnapshot?: string;

  @ApiPropertyOptional({
    example: 'Casa azul con porton negro',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  deliveryReferenceSnapshot?: string;

  @ApiPropertyOptional({ example: 'Tocar el timbre al llegar', nullable: true })
  @IsOptional()
  @IsString()
  deliveryNotesSnapshot?: string;

  @ApiPropertyOptional({ example: 4.5, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  estimatedDistanceKm?: number;

  @ApiPropertyOptional({ example: 18, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  estimatedTravelMinutes?: number;

  @ApiPropertyOptional({ example: 20.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseDeliveryFeeSnapshot?: number;

  @ApiPropertyOptional({ example: 20.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  finalDeliveryFeeSnapshot?: number;

  @ApiPropertyOptional({
    example: 'Delivery local vinculado desde Logistica.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  observation?: string;
}
