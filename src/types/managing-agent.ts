import type { ListParams } from './api';

export interface ManagingAgent {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  notes?: string;
}

export type ManagingAgentFormInput = Omit<ManagingAgent, 'id'>;

export interface ManagingAgentListParams extends ListParams {
  search?: string;
}
