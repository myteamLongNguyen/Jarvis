import type { ListParams } from './api';

export const TENANT_ENTITY_TYPES = ['COMPANY', 'INDIVIDUAL', 'GOVERNMENT'] as const;
export type TenantEntityType = (typeof TENANT_ENTITY_TYPES)[number];

export interface Tenant {
  id: string;
  name: string;
  entityType: TenantEntityType;
  abn?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export type TenantFormInput = Omit<Tenant, 'id'>;

export interface TenantListParams extends ListParams {
  search?: string;
  entityType?: TenantEntityType;
}
