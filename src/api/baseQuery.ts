import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import { apiClient } from './client';

interface AxiosBaseQueryArgs {
  url: string;
  method: AxiosRequestConfig['method'];
  data?: AxiosRequestConfig['data'];
  params?: AxiosRequestConfig['params'];
  /** Overrides the client default. Only needed for endpoints that legitimately run long. */
  timeout?: number;
}

interface AxiosBaseQueryError {
  status?: number;
  message: string;
}

export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method, data, params, timeout }) => {
    try {
      const result = await apiClient.request({ url, method, data, params, timeout });
      return { data: result.data };
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? axiosError.message;
      if (__DEV__) {
        console.error(`[api] ${method} ${url} failed:`, axiosError.response?.status, message);
      }
      return {
        error: {
          status: axiosError.response?.status,
          message,
        },
      };
    }
  };
