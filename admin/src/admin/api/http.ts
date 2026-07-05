import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { supabase } from "../../lib/supabase";

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta: { page?: number; pageSize?: number; totalCount?: number } | null;
  error: { message: string } | null;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_ADMIN_API_BASE_URL || "/api/admin/v1",
  headers: { "content-type": "application/json" },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (error.response?.status === 401 && request && !request._retried) {
      request._retried = true;
      await supabase.auth.refreshSession();
      return api(request);
    }
    return Promise.reject(error);
  }
);

export async function adminGet<T>(url: string, params?: Record<string, unknown>): Promise<ApiEnvelope<T>> {
  return (await api.get<ApiEnvelope<T>>(url, { params })).data;
}

export async function adminPatch<T>(url: string, payload: unknown): Promise<ApiEnvelope<T>> {
  return (await api.patch<ApiEnvelope<T>>(url, payload)).data;
}

export default api;
