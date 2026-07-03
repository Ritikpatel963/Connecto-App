import { BaseRecord, User } from "../types";
import { request, resourceAction } from "./client";
import { mockStore } from "./mockStore";
import { createResourceApi } from "./resource";

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

export const usersApi = {
  ...base,
  detail: (id: string | number) => request<UserDetail>(
    { url: `/users/${id}/detail`, method: "GET" },
    () => {
      const user = mockStore.get<User>("users", id);
      const userId = Number(id);
      const related = (resource: string, keys: string[]) => mockStore.rows(resource).filter((row) => keys.some((key) => Number(row[key]) === userId));
      return {
        user,
        languages: related("user-languages", ["user_id"]),
        interests: related("user-interests", ["user_id"]),
        favourites: related("favourites", ["user_id", "favourite_user_id"]),
        ratings: related("ratings", ["rater_user_id", "rated_user_id"]),
        calls: related("calls", ["caller_user_id", "receiver_user_id"]),
        wallet: mockStore.rows("wallets").find((row) => Number(row.user_id) === userId),
        transactions: mockStore.rows("wallet-transactions"),
        referrals: related("referrals", ["referrer_user_id", "referred_user_id"]),
        redemptions: related("referral-redemptions", ["user_id"]),
        idVerifications: related("id-verifications", ["user_id"]),
        voiceVerifications: related("voice-verifications", ["user_id"]),
      };
    }
  ),
  suspend: (id: string | number) => resourceAction<User>("users", id, "suspend", {}, { is_active: false, status: "suspended" }),
  activate: (id: string | number) => resourceAction<User>("users", id, "activate", {}, { is_active: true, status: "active" }),
};
