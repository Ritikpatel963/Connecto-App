import { ListParams, ListResponse, Verification } from "../types";
import { resourceAction } from "./client";
import { createResourceApi } from "./resource";
import { supabase } from "../../lib/supabase";

const idBase = createResourceApi<Verification>("id-verifications");
const voiceBase = createResourceApi<Verification>("voice-verifications");
const useMocks = process.env.REACT_APP_USE_MOCK_API === "true";

const enrichedList = (
  base: ReturnType<typeof createResourceApi<Verification>>,
  type: "id" | "voice"
) => async (params: ListParams): Promise<ListResponse<Verification>> => {
  const result = await base.list(params);
  if (useMocks || !result.data.length) return result;

  const userIds = Array.from(new Set(result.data.map((row) => row.user_id).filter(Boolean)));
  const adminIds = Array.from(new Set(result.data.map((row) => row.reviewed_by_admin_id).filter(Boolean)));
  const [{ data: users, error: usersError }, { data: admins, error: adminsError }] = await Promise.all([
    userIds.length ? supabase.from("users").select("id, name").in("id", userIds) : Promise.resolve({ data: [], error: null }),
    adminIds.length ? supabase.from("admins").select("id, name").in("id", adminIds) : Promise.resolve({ data: [], error: null }),
  ]);

  if (usersError) throw new Error(usersError.message);
  if (adminsError) throw new Error(adminsError.message);

  const userNames = new Map((users || []).map((row) => [String(row.id), row.name]));
  const adminNames = new Map((admins || []).map((row) => [String(row.id), row.name]));
  return {
    ...result,
    data: result.data.map((row) => ({
      ...row,
      user: userNames.get(String(row.user_id)) || `User #${row.user_id}`,
      reviewed_by_admin: row.reviewed_by_admin_id
        ? adminNames.get(String(row.reviewed_by_admin_id)) || `Admin #${row.reviewed_by_admin_id}`
        : undefined,
      document: type === "id" ? row.document || "Identity document" : row.document,
      sample: type === "voice" ? row.sample || "Voice recording" : row.sample,
    })),
  };
};

const actions = (resource: string) => ({
  approve: (id: string | number) => resourceAction<Verification>(resource, id, "approve", {}, { status: "approved", reviewed_at: new Date().toISOString() }),
  reject: (id: string | number, rejection_reason: string) => resourceAction<Verification>(resource, id, "reject", { rejection_reason }, { status: "rejected", rejection_reason, reviewed_at: new Date().toISOString() }),
});

export const idVerificationsApi = { ...idBase, list: enrichedList(idBase, "id"), ...actions("id-verifications") };
export const voiceVerificationsApi = { ...voiceBase, list: enrichedList(voiceBase, "voice"), ...actions("voice-verifications") };
