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

export const RENT_ROLL_STATUSES = [...RENTAL_INCOME_STATUSES, 'MISSING'] as const;
export type RentRollStatus = (typeof RENT_ROLL_STATUSES)[number];

export interface RentRollRow {
  propertyId: string;
  propertyName: string;
  /** Null when the month has no record, or when several records make up the row. */
  rentalIncomeId: string | null;
  status: RentRollStatus;
  grossAmount: number;
  netAmount: number;
  amountReceived: number;
  outstanding: number;
  periodStart?: string;
  periodEnd?: string;
  receivedDate?: string;
  agentCommission: number;
  hasDocument: boolean;
  invoiceId?: string;
  invoiceNumber?: string;
  documentId?: string;
  apportioned: boolean;
  recordCount: number;
  expectedFromLease?: number;
}

export interface RentRoll {
  month: string;
  periodStart: string;
  periodEnd: string;
  totals: {
    expected: number;
    received: number;
    outstanding: number;
    propertiesTotal: number;
    propertiesReceived: number;
    propertiesMissing: number;
  };
  rows: RentRollRow[];
}

export interface RentRollParams {
  month?: string;
  includePersonal?: boolean;
}
