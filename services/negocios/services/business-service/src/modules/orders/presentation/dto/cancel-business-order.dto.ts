import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { business_order_cancelled_by } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CancelBusinessOrderDto {
  @ApiProperty({ maxLength: 64, example: 'ORD-10001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  externalOrderCode!: string;

  @ApiProperty({
    enum: business_order_cancelled_by,
    enumName: 'business_order_cancelled_by',
  })
  @IsEnum(business_order_cancelled_by)
  cancelledBy!: business_order_cancelled_by;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
