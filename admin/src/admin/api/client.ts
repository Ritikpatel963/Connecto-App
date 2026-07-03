import axios, { AxiosRequestConfig } from "axios";
import { BaseRecord, ListParams, ListResponse } from "../types";
import { mockStore } from "./mockStore";

export const apiClient = axios.create({
  baseURL: "/api/admin",
  timeout: 12000,
  headers: { "Content-Type": "application/json" },
});

const useMocks = process.env.REACT_APP_USE_MOCK_API !== "false";
const wait = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

async function withFallback<T>(request: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (useMocks) {
    await wait();
    return fallback();
  }
  try {
    return await request();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      await wait();
      return fallback();
    }
    throw error;
  }
}

export async function listResource<T extends BaseRecord>(resource: string, params: ListParams): Promise<ListResponse<T>> {
  return withFallback(
    async () => {
      const response = await apiClient.get<ListResponse<T>>(`/${resource}`, { params: { ...params, filters: JSON.stringify(params.filters || {}) } });
      return response.data;
    },
    () => mockStore.list<T>(resource, params)
  );
}

export async function getResource<T extends BaseRecord>(resource: string, id: string | number): Promise<T> {
  return withFallback(
    async () => (await apiClient.get<T>(`/${resource}/${id}`)).data,
    () => mockStore.get<T>(resource, id)
  );
}

export async function createResource<T extends BaseRecord>(resource: string, payload: Partial<T>): Promise<T> {
  return withFallback(
    async () => (await apiClient.post<T>(`/${resource}`, payload)).data,
    () => mockStore.create<T>(resource, payload)
  );
}

export async function updateResource<T extends BaseRecord>(resource: string, id: string | number, payload: Partial<T>): Promise<T> {
  return withFallback(
    async () => (await apiClient.patch<T>(`/${resource}/${id}`, payload)).data,
    () => mockStore.update<T>(resource, id, payload)
  );
}

export async function deleteResource(resource: string, id: string | number): Promise<void> {
  return withFallback(
    async () => { await apiClient.delete(`/${resource}/${id}`); },
    () => mockStore.remove(resource, id)
  );
}

export async function resourceAction<T extends BaseRecord>(
  resource: string,
  id: string | number,
  action: string,
  payload: Record<string, unknown> = {},
  mockPayload: Partial<T> = {}
): Promise<T> {
  return withFallback(
    async () => (await apiClient.post<T>(`/${resource}/${id}/${action}`, payload)).data,
    () => mockStore.update<T>(resource, id, mockPayload)
  );
}

export async function request<T>(config: AxiosRequestConfig, mock: () => T | Promise<T>): Promise<T> {
  return withFallback(async () => (await apiClient.request<T>(config)).data, mock);
}
