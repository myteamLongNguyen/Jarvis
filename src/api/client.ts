import axios from 'axios';
import { supabase } from '../lib/supabase';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
});

type DispatchLike = (action: unknown) => unknown;
let dispatch: DispatchLike | null = null;
let onUnauthorized: (() => unknown) | null = null;

// Wired up from store/index.ts after the store is created, avoiding a hard
// import cycle between the api client and the slices that call it.
export function injectAuthHandlers(deps: { dispatch: DispatchLike; onUnauthorized: () => unknown }) {
  dispatch = deps.dispatch;
  onUnauthorized = deps.onUnauthorized;
}

apiClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      if (dispatch && onUnauthorized) {
        dispatch(onUnauthorized());
      }
    }
    return Promise.reject(error);
  }
);

export const onGet = <T = unknown>(url: string, params?: object) =>
  apiClient.get<T>(url, { params }).then((res) => res.data);

export const onPost = <T = unknown>(url: string, data?: object) =>
  apiClient.post<T>(url, data).then((res) => res.data);

export const onPatch = <T = unknown>(url: string, data?: object) =>
  apiClient.patch<T>(url, data).then((res) => res.data);

export const onDelete = <T = unknown>(url: string) =>
  apiClient.delete<T>(url).then((res) => res.data);
