import { BaseRecord, ListParams, ListResponse } from "../types";
import { createResource, deleteResource, getResource, listResource, updateResource } from "./client";

export const createResourceApi = <T extends BaseRecord>(resource: string) => ({
  list: (params: ListParams): Promise<ListResponse<T>> => listResource<T>(resource, params),
  get: (id: string | number): Promise<T> => getResource<T>(resource, id),
  create: (payload: Partial<T>): Promise<T> => createResource<T>(resource, payload),
  update: (id: string | number, payload: Partial<T>): Promise<T> => updateResource<T>(resource, id, payload),
  remove: (id: string | number): Promise<void> => deleteResource(resource, id),
});
