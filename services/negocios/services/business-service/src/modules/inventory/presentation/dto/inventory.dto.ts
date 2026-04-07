import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ReservationDetailDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: '50.00' })
  @IsString()
  @IsNotEmpty()
  baseUnitPrice: string;

  @ApiProperty({ example: '100.00' })
  @IsString()
  @IsNotEmpty()
  baseSubtotal: string;
}

export class ValidateAndReserveDto {
  @ApiProperty({ example: 'REQ-12345' })
  @IsString()
  @IsNotEmpty()
  reservationCode: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  businessId: number;

  @ApiProperty({ example: 99 })
  @IsInt()
  @IsNotEmpty()
  externalCustomerId: number;

  @ApiProperty({ example: '2026-03-28T15:00:00Z' })
  @IsString()
  @IsNotEmpty()
  expiresAt: string;

  @ApiProperty({ type: [ReservationDetailDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReservationDetailDto)
  details: ReservationDetailDto[];
}

export class ConfirmReservationDto {
  @ApiProperty({ example: 'REQ-12345' })
  @IsString()
  @IsNotEmpty()
  reservationCode: string;
}

export class ReleaseReservationDto {
  @ApiProperty({ example: 'REQ-12345' })
  @IsString()
  @IsNotEmpty()
  reservationCode: string;

  @ApiProperty({ example: 'Customer cancelled order' })
  @IsString()
  @IsOptional()
  reason?: string;
}
