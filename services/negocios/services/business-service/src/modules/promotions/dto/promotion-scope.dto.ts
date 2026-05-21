import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum PromotionScopeType {
  BUSINESS = 'business',
  PRODUCT = 'product',
  PRODUCT_TYPE = 'product_type',
}

export class PromotionScopeDto {
  @IsEnum(PromotionScopeType)
  scopeType: PromotionScopeType;

  @IsString()
  @IsNotEmpty()
  targetReferenceId: string;
}
