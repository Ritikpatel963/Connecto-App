import { BaseRecord, ListParams, ListResponse, Subscription, SubscriptionStats } from "../types";
import { adminGet, adminPatch } from "./http";

const listParams = (params: ListParams) => ({
  page: params.page,
  pageSize: params.pageSize,
  search: params.search || undefined,
  sortBy: params.sortBy || undefined,
  sortDirection: params.sortDirection || undefined,
  status: params.filters?.status || undefined,
  plan_id: params.filters?.plan_id || undefined,
  from: params.filters?.from || undefined,
  to: params.filters?.to || undefined,
});

export const subscriptionsApi = {
  list: async (params: ListParams): Promise<ListResponse<Subscription>> => {
    const response = await adminGet<Subscription[]>("/subscriptions", listParams(params));
    return {
      data: response.data,
      total: response.meta?.totalCount || 0,
      page: response.meta?.page || params.page,
      pageSize: response.meta?.pageSize || params.pageSize,
    };
  },
  get: async (id: string | number): Promise<Subscription> => {
    const response = await adminGet<Subscription>(`/subscriptions/${id}`);
    return response.data;
  },
  update: async (id: string | number, payload: Partial<Subscription>): Promise<Subscription> => {
    const response = await adminPatch<Subscription>(`/subscriptions/${id}`, payload);
    return response.data;
  },
  stats: async (): Promise<SubscriptionStats> => {
    const response = await adminGet<SubscriptionStats>("/subscriptions/stats");
    return response.data;
  },
};

export type SubscriptionPatch = Partial<BaseRecord & Subscription>;
