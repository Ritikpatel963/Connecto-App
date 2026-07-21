import { BaseRecord, ListParams, ListResponse } from "../types";
import { mockStore } from "./mockStore";
import { supabase } from "../../lib/supabase";

const useMocks = process.env.REACT_APP_USE_MOCK_API === "true";
const wait = (ms = 280) => new Promise((resolve) => setTimeout(resolve, ms));

const tableNames: Record<string, string> = {
  "user-languages": "user_languages",
  "user-interests": "user_interests",
  "id-verifications": "id_verifications",
  "voice-verifications": "voice_verifications",
  "wallet-transactions": "wallet_transactions",
  "referral-tiers": "referral_tiers",
  "referral-redemptions": "referral_redemptions",
  "role-permissions": "role_permissions",
};

const searchColumns: Record<string, string[]> = {
  users: ["name", "phone_number", "country", "state", "city", "bio"],
  calls: ["agora_channel_name", "status"],
  ratings: ["review_text"],
  conversations: ["status"],
  messages: ["message_text", "message_type"],
  "id-verifications": ["status", "rejection_reason"],
  "voice-verifications": ["status", "rejection_reason"],
  "wallet-transactions": ["transaction_type", "payment_method", "verification_status"],
  "referral-redemptions": ["status", "rejection_reason"],
  admins: ["name", "email"],
  roles: ["name", "description"],
  permissions: ["name", "description"],
};

const tableFor = (resource: string) => tableNames[resource] || resource.replace(/-/g, "_");
const escapeSearch = (value: string) => value.replace(/[%,().]/g, " ").trim();

async function withFallback<T>(request: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (useMocks) {
    await wait();
    return fallback();
  }
  return request();
}

export async function listResource<T extends BaseRecord>(resource: string, params: ListParams): Promise<ListResponse<T>> {
  return withFallback(
    async () => {
      let query = supabase.from(tableFor(resource)).select("*", { count: "exact" });

      Object.entries(params.filters || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== "all") query = query.eq(key, value);
      });

      const search = escapeSearch(params.search || "");
      const columns = searchColumns[resource] || [];
      if (search && columns.length) query = query.or(columns.map((column) => `${column}.ilike.%${search}%`).join(","));
      const userCols = [
        { idCol: 'user_id', nameCol: 'user' },
        { idCol: 'referrer_user_id', nameCol: 'referrer' },
        { idCol: 'referred_user_id', nameCol: 'referred' },
        { idCol: 'caller_user_id', nameCol: 'caller' },
        { idCol: 'receiver_user_id', nameCol: 'receiver' },
        { idCol: 'user_one_id', nameCol: 'user_one' },
        { idCol: 'user_two_id', nameCol: 'user_two' },
        { idCol: 'rater_user_id', nameCol: 'rater' },
        { idCol: 'rated_user_id', nameCol: 'rated' },
        { idCol: 'sender_id', nameCol: 'sender' },
      ];

      let sortBy = params.sortBy;
      if (sortBy) {
        const mappedCol = userCols.find((c) => c.nameCol === sortBy);
        if (mappedCol) sortBy = mappedCol.idCol;
        query = query.order(sortBy, { ascending: params.sortDirection !== "desc" });
      }

      const from = (params.page - 1) * params.pageSize;
      const { data, error, count } = await query.range(from, from + params.pageSize - 1);
      if (error) throw error;

      let rows = (data || []) as Record<string, any>[];
      const userIds = new Set<number>();
      for (const row of rows) {
        for (const col of userCols) {
          if (row[col.idCol]) userIds.add(row[col.idCol]);
        }
      }

      if (userIds.size > 0) {
        const { data: users } = await supabase.from('users').select('id, name, phone_number').in('id', Array.from(userIds));
        if (users) {
          const userMap = new Map(users.map((u: any) => [u.id, u]));
          rows = rows.map((row) => {
            const newRow = { ...row };
            for (const col of userCols) {
              if (newRow[col.idCol]) {
                const u = userMap.get(newRow[col.idCol]);
                if (!newRow[col.nameCol] || !newRow[col.nameCol].includes(':::')) {
                  newRow[col.nameCol] = `${u?.name || "Unknown"}:::${u?.phone_number || ""}`;
                }
              }
            }
            return newRow;
          });
        }
      }

      return { data: rows as T[], total: count || 0, page: params.page, pageSize: params.pageSize };
    },
    () => mockStore.list<T>(resource, params)
  );
}

export async function getResource<T extends BaseRecord>(resource: string, id: string | number): Promise<T> {
  return withFallback(
    async () => {
      const { data, error } = await supabase.from(tableFor(resource)).select("*").eq("id", id).single();
      if (error) throw error;
      
      const row = data as Record<string, any>;
      const userCols = [
        { idCol: 'user_id', nameCol: 'user' },
        { idCol: 'referrer_user_id', nameCol: 'referrer' },
        { idCol: 'referred_user_id', nameCol: 'referred' },
        { idCol: 'caller_user_id', nameCol: 'caller' },
        { idCol: 'receiver_user_id', nameCol: 'receiver' },
        { idCol: 'user_one_id', nameCol: 'user_one' },
        { idCol: 'user_two_id', nameCol: 'user_two' },
        { idCol: 'rater_user_id', nameCol: 'rater' },
        { idCol: 'rated_user_id', nameCol: 'rated' },
        { idCol: 'sender_id', nameCol: 'sender' },
      ];
      const userIds = new Set<number>();
      for (const col of userCols) {
        if (row[col.idCol]) userIds.add(row[col.idCol]);
      }
      if (userIds.size > 0) {
        const { data: users } = await supabase.from('users').select('id, name').in('id', Array.from(userIds));
        if (users) {
          const userMap = new Map(users.map((u: any) => [u.id, u.name]));
          for (const col of userCols) {
            if (row[col.idCol] && !row[col.nameCol]) {
              row[col.nameCol] = userMap.get(row[col.idCol]) || "Unknown";
            }
          }
        }
      }
      
      return row as T;
    },
    () => mockStore.get<T>(resource, id)
  );
}

export async function createResource<T extends BaseRecord>(resource: string, payload: Partial<T>): Promise<T> {
  return withFallback(
    async () => {
      const { data, error } = await supabase.from(tableFor(resource)).insert(payload as any).select().single();
      if (error) throw error;
      return data as T;
    },
    () => mockStore.create<T>(resource, payload)
  );
}

export async function updateResource<T extends BaseRecord>(resource: string, id: string | number, payload: Partial<T>): Promise<T> {
  return withFallback(
    async () => {
      const { data, error } = await supabase.from(tableFor(resource)).update(payload as any).eq("id", id).select().single();
      if (error) throw error;
      return data as T;
    },
    () => mockStore.update<T>(resource, id, payload)
  );
}

export async function deleteResource(resource: string, id: string | number): Promise<void> {
  return withFallback(
    async () => {
      const { error } = await supabase.from(tableFor(resource)).delete().eq("id", id);
      if (error) throw error;
    },
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
    async () => {
      const update = Object.keys(mockPayload).length ? mockPayload : payload;
      const { data, error } = await supabase.from(tableFor(resource)).update(update as any).eq("id", id).select().single();
      if (error) throw error;
      return data as T;
    },
    () => mockStore.update<T>(resource, id, mockPayload)
  );
}

// Legacy composite endpoints (user detail and permission matrix) still use their
// existing local adapters until they are replaced with database views/RPCs.
export async function request<T>(_config: unknown, fallback: () => T | Promise<T>): Promise<T> {
  if (useMocks) await wait();
  return fallback();
}

