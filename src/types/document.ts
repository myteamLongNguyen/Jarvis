import type { ListParams } from './api';

export const DOCUMENT_TYPES = [
  'LEASE',
  'LEASE_VARIATION',
  'RENT_REVIEW_NOTICE',
  'INVOICE',
  'PROPERTY_STATEMENT',
  'COMMISSION_INVOICE',
  'VALUATION',
  'PHOTO',
  'SITE_PLAN',
  'COMPLIANCE_CERT',
  'INSURANCE_POLICY',
  'RATES_NOTICE',
  'CORRESPONDENCE',
  'OTHER',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface PropertyDocument {
  id: string;
  propertyId?: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  documentDate: string;
  url: string;
  mimeType?: string;
  fileSizeBytes?: number;
  createdAt: string;
}

export interface DocumentListParams extends ListParams {
  propertyId?: string;
  documentType?: DocumentType;
}

export interface DocumentUploadInput {
  propertyId?: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  documentDate: string;
  file: { uri: string; name: string; type: string };
}
