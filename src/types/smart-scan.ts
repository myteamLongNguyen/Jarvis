import type { DocumentType } from './document';
import type { InvoiceDirection, InvoiceType, PropertyExpenseCategory } from './invoice';
import type { BondType, LeaseStatus, OutgoingsRecoveryType, RentFrequency, RentReviewMechanism } from './lease';
import type { DepreciationMethod } from './depreciation-schedule';

/** Which app form a scanned document should open. Mirrors SmartScanKind on the server. */
export const SMART_SCAN_KINDS = [
  'INVOICE',
  'LEASE',
  'RENT_REVIEW',
  'RENTAL_STATEMENT',
  'DEPRECIATION_SCHEDULE',
  'OTHER',
] as const;
export type SmartScanKind = (typeof SMART_SCAN_KINDS)[number];

/** PDF_TEXT is the cheap path (the PDF had a text layer); DOCUMENT_IMAGE sent page pixels. */
export type SmartScanSource = 'PDF_TEXT' | 'DOCUMENT_IMAGE';

export interface SmartScanInvoiceLineItem {
  lineNumber: number;
  description: string;
  category?: PropertyExpenseCategory;
  quantity?: number;
  unitAmount?: number;
  amount?: number;
  gstAmount?: number;
}

export interface SmartScanInvoiceForm {
  direction?: InvoiceDirection;
  invoiceType?: InvoiceType;
  invoiceNumber?: string;
  issuerName?: string;
  issuerAbn?: string;
  issueDate?: string;
  dueDate?: string;
  periodStart?: string;
  periodEnd?: string;
  subtotal?: number;
  gstAmount?: number;
  totalAmount?: number;
  currency?: string;
  lineItems?: SmartScanInvoiceLineItem[];
}

export interface SmartScanLeaseForm {
  /** Name as written on the lease — not resolved to a tenant record yet. */
  tenantName?: string;
  status?: LeaseStatus;
  commencementDate?: string;
  expiryDate?: string;
  initialTermMonths?: number;
  baseRentAnnual?: number;
  rentFrequency?: RentFrequency;
  outgoingsRecoveryType?: OutgoingsRecoveryType;
  rentReviewMechanism?: RentReviewMechanism;
  rentReviewValue?: number;
  nextReviewDate?: string;
  rentFreePeriodMonths?: number;
  bondAmount?: number;
  bondType?: BondType;
  optionTerms?: { termMonths: number; exerciseByDate?: string }[];
}

export interface SmartScanRentReviewForm {
  reviewDate?: string;
  reviewType?: RentReviewMechanism;
  oldRentAnnual?: number;
  newRentAnnual?: number;
  percentChange?: number;
}

export interface SmartScanRentalIncomeForm {
  periodStart?: string;
  periodEnd?: string;
  grossAmount?: number;
  outgoingsReimbursed?: number;
  gstAmount?: number;
  agentCommission?: number;
  otherDeductions?: number;
  amountReceived?: number;
  receivedDate?: string;
}

export interface SmartScanDepreciationForm {
  financialYearStart?: string;
  financialYearEnd?: string;
  method?: DepreciationMethod;
  division40Amount?: number;
  division43Amount?: number;
  totalAmount?: number;
}

export interface SmartScanForms {
  invoice?: SmartScanInvoiceForm;
  lease?: SmartScanLeaseForm;
  rentReview?: SmartScanRentReviewForm;
  rentalIncome?: SmartScanRentalIncomeForm;
  depreciationSchedule?: SmartScanDepreciationForm;
}

export interface SmartScanMatch {
  propertyId?: string;
  propertyName?: string;
  propertyMatchConfidence?: 'HIGH' | 'LOW';
  /** Active lease on the matched property — a rent review has to be filed against one. */
  leaseId?: string;
  leaseLabel?: string;
}

export interface SmartScanUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
}

export interface SmartScanResult {
  documentKind: SmartScanKind;
  documentType: DocumentType;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  summary: string;
  documentDate?: string;
  expiryDate?: string;
  match: SmartScanMatch;
  warnings: string[];
  /** Only the section matching `documentKind` is populated. */
  forms: SmartScanForms;
  source: SmartScanSource;
  usage: SmartScanUsage;
}

export interface SmartScanFile {
  uri: string;
  name: string;
  type: string;
}
