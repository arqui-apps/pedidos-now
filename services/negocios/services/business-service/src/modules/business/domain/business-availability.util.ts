import { business_business_status } from '@prisma/client';
import {
  ActiveTemporaryClosureSnapshot,
  BusinessAvailabilitySnapshot,
} from './business.types';

interface ResolveBusinessAvailabilityInput {
  businessStatus: business_business_status;
  retiredAt: Date | null;
  deletedAt: Date | null;
  activeTemporaryClosure: ActiveTemporaryClosureSnapshot | null;
}

export function resolveBusinessAvailability(
  input: ResolveBusinessAvailabilityInput,
): BusinessAvailabilitySnapshot {
  if (input.deletedAt) {
    return {
      isAvailable: false,
      availabilityReason: 'deleted',
      activeTemporaryClosure: input.activeTemporaryClosure,
    };
  }

  if (
    input.businessStatus === business_business_status.retired ||
    input.retiredAt
  ) {
    return {
      isAvailable: false,
      availabilityReason: 'retired',
      activeTemporaryClosure: input.activeTemporaryClosure,
    };
  }

  if (input.activeTemporaryClosure) {
    return {
      isAvailable: false,
      availabilityReason: 'temporarily_closed',
      activeTemporaryClosure: input.activeTemporaryClosure,
    };
  }

  switch (input.businessStatus) {
    case business_business_status.active:
      return {
        isAvailable: true,
        availabilityReason: 'active',
        activeTemporaryClosure: null,
      };

    case business_business_status.temporarily_closed:
      return {
        isAvailable: false,
        availabilityReason: 'temporarily_closed',
        activeTemporaryClosure: null,
      };

    case business_business_status.suspended:
      return {
        isAvailable: false,
        availabilityReason: 'suspended',
        activeTemporaryClosure: null,
      };

    case business_business_status.inactive:
      return {
        isAvailable: false,
        availabilityReason: 'inactive',
        activeTemporaryClosure: null,
      };

    default:
      return {
        isAvailable: false,
        availabilityReason: 'inactive',
        activeTemporaryClosure: null,
      };
  }
}
