import type { ListParams } from './api';

export const PROPERTY_TYPES = ['COMMERCIAL', 'RESIDENTIAL', 'INDUSTRIAL', 'MIXED_USE', 'LAND'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = ['ACTIVE', 'UNDER_CONTRACT', 'SOLD', 'ARCHIVED'] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const PROPERTY_CATEGORIES = ['INVESTMENT', 'PERSONAL'] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];

export interface Property {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  propertyType: PropertyType;
  status: PropertyStatus;
  category: PropertyCategory;
  purchaseDate: string;
  purchasePrice: number;
  purchaseCosts: number;
  purchaseCurrency: string;
  landAreaSqm?: number;
  buildingAreaSqm?: number;
  ownedByEntityId?: string;
  managingAgentId?: string;
  notes?: string;
}

export interface PropertyListParams extends ListParams {
  status?: PropertyStatus;
  propertyType?: PropertyType;
  category?: PropertyCategory;
  search?: string;
}

export type PropertyFormInput = Omit<Property, 'id' | 'category'> & { category?: PropertyCategory };

export interface PropertySummary {
  activeLeases: number;
  currentAnnualRent: number;
  ytdGrossIncome: number;
  ytdNetIncome: number;
  ytdMaintenance: number;
  lastValuation?: number;
  yieldOnCost: number;
  yieldOnValuation?: number;
  unpaidInvoicesTotal: number;
  nextRentReview?: string;
  expiringLeases: number;
}

export interface PropertyReturn {
  grossYieldOnCost: number;
  netYieldOnCost: number;
  grossYieldOnCurrentValuation: number;
  netYieldOnCurrentValuation: number;
  cashOnCashReturn: number;
  totalReturnSincePurchase: number;
}
