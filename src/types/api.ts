export interface SingleResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ListResponse<T> {
  offset: number;
  limit: number;
  total: number;
  items: T[];
}

export interface ListParams {
  offset?: number;
  limit?: number;
}
