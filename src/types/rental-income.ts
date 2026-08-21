import type { ListParams } from './api';

export const RENTAL_INCOME_STATUSES = ['EXPECTED', 'INVOICED', 'RECEIVED', 'OVERDUE', 'WRITTEN_OFF'] as const;
export type RentalIncomeStatus = (typeof RENTAL_INCOME_STATUSES)[number];

export interface RentalIncome {
  id: string;
  propertyId: string;
  leaseId?: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  outgoingsReimbursed?: number;
  gstAmount?: number;
  agentCommission?: number;
  otherDeductions?: number;
  netAmount: number;
  amountReceived?: number;
  receivedDate?: string;
  status: RentalIncomeStatus;
  sourceInvoiceId?: string;
  sourceStatementId?: string;
  notes?: string;
}

export type RentalIncomeFormInput = Omit<RentalIncome, 'id' | 'netAmount'>;

export interface RentalIncomeListParams extends ListParams {
  propertyId?: string;
  status?: RentalIncomeStatus;
  from?: string;
  to?: string;
  groupBy?: 'month' | 'quarter' | 'year';
}
