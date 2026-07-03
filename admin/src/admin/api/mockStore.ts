import { entityConfigs } from "../../data/adminSchema";
import { BaseRecord, ListParams, ListResponse } from "../types";

type Store = Record<string, BaseRecord[]>;

const keyMap: Record<string, string> = {
  "user-languages": "user-languages",
  "user-interests": "user-interests",
  "id-verifications": "id-verifications",
  "voice-verifications": "voice-verifications",
  "wallet-transactions": "wallet-transactions",
  "referral-tiers": "referral-tiers",
  "referral-redemptions": "referral-redemptions",
  "role-permissions": "role-permissions",
};

const source = entityConfigs as Record<string, { rows: BaseRecord[] }>;
const store: Store = Object.fromEntries(
  Object.entries(source).map(([key, config]) => [keyMap[key] || key, config.rows.map((row) => ({ ...row }))])
);

const valueForSearch = (record: BaseRecord) =>
  Object.values(record)
    .filter((value) => typeof value !== "object")
    .join(" ")
    .toLowerCase();

export const mockStore = {
  list<T extends BaseRecord>(resource: string, params: ListParams): ListResponse<T> {
    let rows = [...(store[resource] || [])] as T[];
    const search = params.search?.trim().toLowerCase();

    if (search) rows = rows.filter((row) => valueForSearch(row).includes(search));

    Object.entries(params.filters || {}).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") return;
      rows = rows.filter((row) => String(row[key]) === String(value));
    });

    if (params.sortBy) {
      const direction = params.sortDirection === "desc" ? -1 : 1;
      rows.sort((a, b) => String(a[params.sortBy! as keyof T] ?? "").localeCompare(String(b[params.sortBy! as keyof T] ?? ""), undefined, { numeric: true }) * direction);
    }

    const total = rows.length;
    const start = (params.page - 1) * params.pageSize;
    return { data: rows.slice(start, start + params.pageSize), total, page: params.page, pageSize: params.pageSize };
  },

  get<T extends BaseRecord>(resource: string, id: string | number): T {
    const row = (store[resource] || []).find((item) => String(item.id) === String(id));
    if (!row) throw new Error("Record not found");
    return { ...row } as T;
  },

  create<T extends BaseRecord>(resource: string, payload: Partial<T>): T {
    const row = { id: `${resource.toUpperCase()}-${Date.now()}`, ...payload } as T;
    store[resource] = [row, ...(store[resource] || [])];
    return row;
  },

  update<T extends BaseRecord>(resource: string, id: string | number, payload: Partial<T>): T {
    let updated: BaseRecord | undefined;
    store[resource] = (store[resource] || []).map((row) => {
      if (String(row.id) !== String(id)) return row;
      updated = { ...row, ...payload };
      return updated;
    });
    if (!updated) throw new Error("Record not found");
    return updated as T;
  },

  remove(resource: string, id: string | number): void {
    store[resource] = (store[resource] || []).filter((row) => String(row.id) !== String(id));
  },

  rows(resource: string): BaseRecord[] {
    return (store[resource] || []).map((row) => ({ ...row }));
  },
};
