import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionScopeDto } from './promotion-scope.dto';

export enum PromotionDiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export class CreatePromotionRequestDto {
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsNotEmpty()
  requestedName: string;

  @IsString()
  @IsOptional()
  requestedDescription?: string;

  @IsEnum(PromotionDiscountType)
  discountType: PromotionDiscountType;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsDateString()
  requestedStartAt: string;

  @IsDateString()
  requestedEndAt: string;

  @IsString()
  @IsOptional()
  requestedStartTime?: string;

  @IsString()
  @IsOptional()
  requestedEndTime?: string;

  @IsNumber()
  @IsOptional()
  currentOrderCount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionScopeDto)
  scopes: PromotionScopeDto[];
}
