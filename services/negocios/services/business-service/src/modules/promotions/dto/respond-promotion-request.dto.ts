import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PromotionDiscountType } from './create-promotion-request.dto';
import { PromotionScopeDto } from './promotion-scope.dto';

export enum PromotionRequestExternalStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export class RespondPromotionRequestDto {
  @IsEnum(PromotionRequestExternalStatus)
  status: PromotionRequestExternalStatus;

  @IsString()
  @IsNotEmpty()
  externalRequestId: string;

  @IsString()
  @IsOptional()
  externalPromotionId?: string;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsDateString()
  @IsOptional()
  approvedStartAt?: string;

  @IsDateString()
  @IsOptional()
  approvedEndAt?: string;

  @IsString()
  @IsOptional()
  approvedStartTime?: string;

  @IsString()
  @IsOptional()
  approvedEndTime?: string;

  @IsEnum(PromotionDiscountType)
  @IsOptional()
  discountType?: PromotionDiscountType;

  @IsNumber()
  @IsOptional()
  discountValue?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionScopeDto)
  @IsOptional()
  approvedScopes?: PromotionScopeDto[];
}
