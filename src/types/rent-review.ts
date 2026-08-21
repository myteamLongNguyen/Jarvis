import type { ListParams } from './api';
import type { RentReviewMechanism } from './lease';

export const RENT_REVIEW_STATUSES = ['SCHEDULED', 'COMPLETED', 'DISPUTED', 'WAIVED'] as const;
export type RentReviewStatus = (typeof RENT_REVIEW_STATUSES)[number];

export interface RentReview {
  id: string;
  leaseId: string;
  reviewDate: string;
  reviewType: RentReviewMechanism;
  oldRentAnnual: number;
  newRentAnnual: number;
  percentChange: number;
  status: RentReviewStatus;
  notes?: string;
  sourceDocumentId?: string;
}

export type RentReviewFormInput = Omit<RentReview, 'id'>;

export interface RentReviewListParams extends ListParams {
  leaseId?: string;
  status?: RentReviewStatus;
}
