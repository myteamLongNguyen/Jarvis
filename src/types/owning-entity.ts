import type { ListParams } from './api';

export const ENTITY_TYPES = ['COMPANY', 'TRUST', 'INDIVIDUAL', 'SMSF', 'PARTNERSHIP'] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];

export interface OwningEntity {
  id: string;
  legalName: string;
  entityType: EntityType;
  abn?: string;
  acn?: string;
  notes?: string;
}

export type OwningEntityFormInput = Omit<OwningEntity, 'id'>;

export interface OwningEntityListParams extends ListParams {
  search?: string;
}
