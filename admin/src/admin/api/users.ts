import { BaseRecord, User } from "../types";
import { resourceAction } from "./client";
import { mockStore } from "./mockStore";
import { createResourceApi } from "./resource";
import { supabase } from "../../lib/supabase";

export interface UserDetail {
  user: User;
  languages: BaseRecord[];
  interests: BaseRecord[];
  favourites: BaseRecord[];
  ratings: BaseRecord[];
  calls: BaseRecord[];
  wallet?: BaseRecord;
  transactions: BaseRecord[];
  referrals: BaseRecord[];
  redemptions: BaseRecord[];
  idVerifications: BaseRecord[];
  voiceVerifications: BaseRecord[];
}

const base = createResourceApi<User>("users");
const useMocks = process.env.REACT_APP_USE_MOCK_API === "true";

const mockDetail = (id: string | number): UserDetail => {
  const user = mockStore.get<User>("users", id);
  const userId = Number(id);
  const related = (resource: string, keys: string[]) => mockStore.rows(resource).filter((row) => keys.some((key) => Number(row[key]) === userId));
  const wallet = mockStore.rows("wallets").find((row) => Number(row.user_id) === userId);

  return {
    user,
    languages: related("user-languages", ["user_id"]),
    interests: related("user-interests", ["user_id"]),
    favourites: related("favourites", ["user_id", "favourite_user_id"]),
    ratings: related("ratings", ["rater_user_id", "rated_user_id"]),
    calls: related("calls", ["caller_user_id", "receiver_user_id"]),
    wallet: wallet || ({ id: "no-wallet", balance: 0 } as any),
    transactions: mockStore.rows("wallet-transactions").filter((row) => row.wallet_id === wallet?.id || String(row.wallet_id) === String(userId)),
    referrals: related("referrals", ["referrer_user_id", "referred_user_id"]),
    redemptions: related("referral-redemptions", ["user_id"]),
    idVerifications: related("id-verifications", ["user_id"]),
    voiceVerifications: related("voice-verifications", ["user_id"]),
  };
};

const queryRows = async (query: PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>): Promise<BaseRecord[]> => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []) as BaseRecord[];
};

const liveDetail = async (id: string | number): Promise<UserDetail> => {
  const user = await base.get(id);
  const userId = user.id;
  const relation = (left: string, right: string) => `${left}.eq.${userId},${right}.eq.${userId}`;

  const [languages, interests, favourites, ratings, calls, wallets, referrals, redemptions, idVerifications, voiceVerifications] = await Promise.all([
    queryRows(supabase.from("user_languages").select("*").eq("user_id", userId)),
    queryRows(supabase.from("user_interests").select("*").eq("user_id", userId)),
    queryRows(supabase.from("favourites").select("*").or(relation("user_id", "favourite_user_id"))),
    queryRows(supabase.from("ratings").select("*").or(relation("rater_user_id", "rated_user_id"))),
    queryRows(supabase.from("calls").select("*").or(relation("caller_user_id", "receiver_user_id"))),
    queryRows(supabase.from("wallets").select("*").eq("user_id", userId).limit(1)),
    queryRows(supabase.from("referrals").select("*").or(relation("referrer_user_id", "referred_user_id"))),
    queryRows(supabase.from("referral_redemptions").select("*").eq("user_id", userId)),
    queryRows(supabase.from("id_verifications").select("*").eq("user_id", userId)),
    queryRows(supabase.from("voice_verifications").select("*").eq("user_id", userId)),
  ]);

  const wallet = wallets[0];
  const relatedUserIds = Array.from(new Set([
    userId,
    ...calls.flatMap((row) => [row.caller_user_id, row.receiver_user_id]),
    ...ratings.flatMap((row) => [row.rater_user_id, row.rated_user_id]),
    ...referrals.flatMap((row) => [row.referrer_user_id, row.referred_user_id]),
    ...favourites.flatMap((row) => [row.user_id, row.favourite_user_id]),
  ].filter((value) => value !== undefined && value !== null)));

  const [transactions, relatedUsers, tiers] = await Promise.all([
    queryRows(supabase.from("wallet_transactions").select("*").or(`wallet_id.eq.${wallet?.id || userId},wallet_id.eq.${userId}`)),
    queryRows(supabase.from("users").select("id, name").in("id", relatedUserIds)),
    queryRows(supabase.from("referral_tiers").select("id, tier_name")),
  ]);

  const names = new Map(relatedUsers.map((row) => [String(row.id), String(row.name)]));
  const tierNames = new Map(tiers.map((row) => [String(row.id), String(row.tier_name)]));
  const nameFor = (value: unknown) => names.get(String(value)) || `User #${value}`;
  const enrichedCalls = calls.map((row) => ({ ...row, caller: nameFor(row.caller_user_id), receiver: nameFor(row.receiver_user_id) }));
  const enrichedRatings = ratings.map((row) => ({ ...row, rater: nameFor(row.rater_user_id), rated: nameFor(row.rated_user_id) }));
  const enrichedReferrals = referrals.map((row) => ({ ...row, referrer: nameFor(row.referrer_user_id), referred: nameFor(row.referred_user_id) }));
  const enrichedRedemptions = redemptions.map((row) => ({ ...row, tier: tierNames.get(String(row.tier_id)) || `Tier #${row.tier_id}` }));

  return {
    user,
    languages,
    interests,
    favourites,
    ratings: enrichedRatings,
    calls: enrichedCalls,
    wallet: wallet || ({ id: "no-wallet", balance: 0 } as any),
    transactions,
    referrals: enrichedReferrals,
    redemptions: enrichedRedemptions,
    idVerifications,
    voiceVerifications,
  };
};

export const usersApi = {
  ...base,
  detail: (id: string | number) => useMocks ? Promise.resolve(mockDetail(id)) : liveDetail(id),
  suspend: (id: string | number) => resourceAction<User>("users", id, "suspend", {}, { is_active: false }),
  activate: (id: string | number) => resourceAction<User>("users", id, "activate", {}, { is_active: true }),
};
