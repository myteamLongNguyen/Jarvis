import type { ListParams } from './api';

export const LEASE_STATUSES = ['DRAFT', 'ACTIVE', 'HOLDOVER', 'EXPIRED', 'TERMINATED'] as const;
export type LeaseStatus = (typeof LEASE_STATUSES)[number];

export const RENT_FREQUENCIES = ['MONTHLY', 'QUARTERLY', 'ANNUALLY'] as const;
export type RentFrequency = (typeof RENT_FREQUENCIES)[number];

export const OUTGOINGS_RECOVERY_TYPES = ['GROSS', 'NET', 'SEMI_GROSS'] as const;
export type OutgoingsRecoveryType = (typeof OUTGOINGS_RECOVERY_TYPES)[number];

export const RENT_REVIEW_MECHANISMS = ['CPI', 'FIXED_PERCENT', 'MARKET', 'HYBRID'] as const;
export type RentReviewMechanism = (typeof RENT_REVIEW_MECHANISMS)[number];

export const BOND_TYPES = ['BANK_GUARANTEE', 'CASH', 'PERSONAL_GUARANTEE'] as const;
export type BondType = (typeof BOND_TYPES)[number];

export interface LeaseOptionTerm {
  termMonths: number;
  exercised: boolean;
  exerciseByDate: string;
}

export interface Lease {
  id: string;
  propertyId: string;
  tenantId: string;
  status: LeaseStatus;
  commencementDate: string;
  expiryDate: string;
  initialTermMonths: number;
  optionTerms?: LeaseOptionTerm[];
  baseRentAnnual: number;
  rentFrequency: RentFrequency;
  outgoingsRecoveryType: OutgoingsRecoveryType;
  rentReviewMechanism: RentReviewMechanism;
  rentReviewValue?: number;
  nextReviewDate?: string;
  rentFreePeriodMonths?: number;
  bondAmount: number;
  bondType: BondType;
  notes?: string;
}

export type LeaseFormInput = Omit<Lease, 'id'>;

export interface LeaseListParams extends ListParams {
  propertyId?: string;
  status?: LeaseStatus;
}
