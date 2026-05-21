import { resolveBusinessAvailability } from '../../domain/business-availability.util';
import { BusinessResponseDto } from '../../presentation/dto/business-response.dto';
import { BusinessRecord } from '../repositories/prisma-business.repository';

export function mapBusinessToResponseDto(
  record: BusinessRecord,
): BusinessResponseDto {
  const activeClosure = record.temporary_business_closure[0]
    ? {
        temporaryBusinessClosureId:
          record.temporary_business_closure[0].temporary_business_closure_id,
        startAt: record.temporary_business_closure[0].start_at,
        endAt: record.temporary_business_closure[0].end_at,
        reason: record.temporary_business_closure[0].reason,
      }
    : null;

  const availability = resolveBusinessAvailability({
    businessStatus: record.business_status,
    retiredAt: record.retired_at,
    deletedAt: record.deleted_at,
    activeTemporaryClosure: activeClosure,
  });

  return {
    businessId: record.business_id,
    tradeName: record.trade_name,
    legalName: record.legal_name,
    businessType: record.business_type,
    businessStatus: record.business_status,
    description: record.description,
    address: record.address,
    phone: record.phone,
    email: record.email,
    taxId: record.tax_id,
    retiredAt: record.retired_at,
    retirementReason: record.retirement_reason,
    deletedAt: record.deleted_at,
    deletionReason: record.deletion_reason,
    availability,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    logoUrl: record.logo_url,
    logoPublicId: record.logo_public_id,
  };
}
