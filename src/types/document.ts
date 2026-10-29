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
  'MANUAL',
  'SERVICE_RECORD',
  'WARRANTY',
  'DEPRECIATION_SCHEDULE',
  'OTHER',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export interface PropertyDocument {
  area: DocumentArea;
  id: string;
  propertyId?: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  documentDate: string;
  expiryDate?: string;
  url: string;
  mimeType?: string;
  fileSizeBytes?: number;
  createdAt: string;
}

export interface DocumentListParams extends ListParams {
  area?: DocumentArea;
  propertyId?: string;
  documentType?: DocumentType;
}

export interface DocumentUploadInput {
  area?: DocumentArea;
  propertyId?: string;
  documentType: DocumentType;
  title: string;
  description?: string;
  documentDate: string;
  expiryDate?: string;
  file: { uri: string; name: string; type: string };
}

export const DOCUMENT_AREAS = ['PROPERTIES', 'ORIAN', 'GENERAL'] as const;
export type DocumentArea = (typeof DOCUMENT_AREAS)[number];

/** The paperwork a vessel keeps, in the order it is usually looked for. */
export const ORIAN_DOCUMENT_TYPES: DocumentType[] = [
  'MANUAL',
  'SERVICE_RECORD',
  'WARRANTY',
  'INVOICE',
  'INSURANCE_POLICY',
  'COMPLIANCE_CERT',
  'PHOTO',
  'CORRESPONDENCE',
  'OTHER',
];
