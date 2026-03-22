import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  business_business_status,
  business_business_type,
} from '@prisma/client';

export class ActiveTemporaryClosureDto {
  @ApiProperty()
  temporaryBusinessClosureId!: number;

  @ApiProperty()
  startAt!: Date;

  @ApiProperty()
  endAt!: Date;

  @ApiPropertyOptional({ nullable: true })
  reason!: string | null;
}

export class BusinessAvailabilityDto {
  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty({
    enum: [
      'active',
      'temporarily_closed',
      'suspended',
      'inactive',
      'retired',
      'deleted',
    ],
  })
  availabilityReason!: string;

  @ApiPropertyOptional({ type: ActiveTemporaryClosureDto, nullable: true })
  activeTemporaryClosure!: ActiveTemporaryClosureDto | null;
}

export class BusinessResponseDto {
  @ApiProperty()
  businessId!: number;

  @ApiProperty()
  tradeName!: string;

  @ApiPropertyOptional({ nullable: true })
  legalName!: string | null;

  @ApiProperty({
    enum: business_business_type,
    enumName: 'business_business_type',
  })
  businessType!: business_business_type;

  @ApiProperty({
    enum: business_business_status,
    enumName: 'business_business_status',
  })
  businessStatus!: business_business_status;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ nullable: true })
  taxId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  retiredAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  retirementReason!: string | null;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  deletionReason!: string | null;

  @ApiProperty({ type: BusinessAvailabilityDto })
  availability!: BusinessAvailabilityDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
