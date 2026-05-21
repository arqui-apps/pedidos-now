import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PromotionDiscountType } from './create-promotion-request.dto';
import { PromotionScopeType } from './promotion-scope.dto';

export enum LocalPromotionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export class SyncPromotionReferenceDto {
  @IsString()
  @IsNotEmpty()
  businessId: string;

  @IsString()
  @IsNotEmpty()
  externalPromotionId: string;

  @IsString()
  @IsOptional()
  externalRequestId?: string;

  @IsEnum(PromotionScopeType)
  scopeType: PromotionScopeType;

  @IsString()
  @IsNotEmpty()
  targetReferenceId: string;

  @IsEnum(LocalPromotionStatus)
  status: LocalPromotionStatus;

  @IsDateString()
  startsAt: string;

  @IsDateString()
  endsAt: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsEnum(PromotionDiscountType)
  discountType: PromotionDiscountType;

  @IsNumber()
  discountValue: number;
}
