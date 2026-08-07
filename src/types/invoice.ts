import type { ListParams } from './api';

export const INVOICE_DIRECTIONS = ['INCOMING', 'OUTGOING'] as const;
export type InvoiceDirection = (typeof INVOICE_DIRECTIONS)[number];

export const INVOICE_STATUSES = [
  'UNSORTED',
  'CLASSIFIED',
  'APPROVED',
  'PAID',
  'OVERDUE',
  'DISPUTED',
  'WRITTEN_OFF',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_TYPES = [
  'AGENT_STATEMENT',
  'RENT_INVOICE',
  'MAINTENANCE',
  'REPAIR',
  'RATES',
  'LAND_TAX',
  'INSURANCE',
  'UTILITIES',
  'MANAGEMENT_FEE',
  'LEASING_COMMISSION',
  'OWNERS_CORP',
  'LEGAL',
  'CAPITAL_WORKS',
  'OTHER',
] as const;
export type InvoiceType = (typeof INVOICE_TYPES)[number];

export interface Invoice {
  id: string;
  direction: InvoiceDirection;
  invoiceType: InvoiceType;
  status: InvoiceStatus;
  issuerName: string;
  issuerAbn?: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate?: string;
  periodStart?: string;
  periodEnd?: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  propertyId?: string;
  notes?: string;
}

export interface PropertyInvoiceListParams extends ListParams {
  status?: InvoiceStatus;
  from?: string;
  to?: string;
}

export interface InvoiceListParams extends ListParams {
  status?: InvoiceStatus;
  propertyId?: string;
  direction?: InvoiceDirection;
  from?: string;
  to?: string;
}

export interface InvoiceFormInput {
  propertyId?: string;
  direction: InvoiceDirection;
  invoiceType: InvoiceType;
  invoiceNumber?: string;
  issuerName: string;
  issuerAbn?: string;
  issueDate: string;
  dueDate?: string;
  periodStart?: string;
  periodEnd?: string;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
  currency: string;
  notes?: string;
}

export interface ClassifyInvoiceInput {
  propertyId: string;
  invoiceType: InvoiceType;
}

export interface PayInvoiceInput {
  paidDate: string;
  paidAmount: number;
}

export interface GeneratePostingsResult {
  rentalIncomes: number;
  propertyExpenses: number;
  maintenanceRecords: number;
}
