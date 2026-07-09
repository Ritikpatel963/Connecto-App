import { FavoriteRecord, ListParams, ListResponse } from "../types";
import { supabase } from "../../lib/supabase";
import { createResourceApi } from "./resource";

export const favoritesApi = {
  ...createResourceApi<FavoriteRecord>("favorites"),

  // Fetch favorites given a user ID (who they liked)
  listUserFavorites: async (userId: number | string, params: ListParams): Promise<ListResponse<FavoriteRecord>> => {
    let query = supabase
      .from("favorites")
      .select(`
        *,
        target_user:users!favorites_target_user_id_fkey(*)
      `, { count: "exact" })
      .eq("user_id", userId);

    if (params.sortBy) {
      query = query.order(params.sortBy, { ascending: params.sortDirection === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query
      .range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);

    if (error) throw new Error(error.message);

    return {
      data: data as any,
      total: count || 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  },

  // Fetch fans given a user ID (who liked them)
  listUserFans: async (userId: number | string, params: ListParams): Promise<ListResponse<FavoriteRecord>> => {
    let query = supabase
      .from("favorites")
      .select(`
        *,
        user:users!favorites_user_id_fkey(*)
      `, { count: "exact" })
      .eq("target_user_id", userId);

    if (params.sortBy) {
      query = query.order(params.sortBy, { ascending: params.sortDirection === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query
      .range((params.page - 1) * params.pageSize, params.page * params.pageSize - 1);

    if (error) throw new Error(error.message);

    return {
      data: data as any,
      total: count || 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  },
};
