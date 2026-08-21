import type { ListParams } from './api';

export const DEPRECIATION_METHODS = ['DIMINISHING_VALUE', 'PRIME_COST'] as const;
export type DepreciationMethod = (typeof DEPRECIATION_METHODS)[number];

export interface DepreciationSchedule {
  id: string;
  propertyId: string;
  financialYearStart: string;
  financialYearEnd: string;
  method: DepreciationMethod;
  division40Amount?: number;
  division43Amount?: number;
  totalAmount: number;
  sourceDocumentId?: string;
  notes?: string;
}

export type DepreciationScheduleFormInput = Omit<DepreciationSchedule, 'id'>;

export interface DepreciationScheduleListParams extends ListParams {
  propertyId?: string;
  method?: DepreciationMethod;
}
