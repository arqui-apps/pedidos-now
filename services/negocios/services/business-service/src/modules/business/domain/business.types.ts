export interface ActiveTemporaryClosureSnapshot {
  temporaryBusinessClosureId: number;
  startAt: Date;
  endAt: Date;
  reason: string | null;
}

export type BusinessAvailabilityReason =
  | 'active'
  | 'temporarily_closed'
  | 'suspended'
  | 'inactive'
  | 'retired'
  | 'deleted';

export interface BusinessAvailabilitySnapshot {
  isAvailable: boolean;
  availabilityReason: BusinessAvailabilityReason;
  activeTemporaryClosure: ActiveTemporaryClosureSnapshot | null;
}
