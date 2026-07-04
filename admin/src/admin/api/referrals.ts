import { BaseRecord, ReferralRedemption } from "../types";
import { resourceAction } from "./client";
import { createResourceApi } from "./resource";
export const referralsApi = createResourceApi<BaseRecord>("referrals");
export const referralTiersApi = createResourceApi<BaseRecord>("referral-tiers");
const base = createResourceApi<ReferralRedemption>("referral-redemptions");
export const redemptionsApi = {
  ...base,
  approve: (id: string | number) => resourceAction<ReferralRedemption>("referral-redemptions", id, "approve", {}, { status: "approved" }),
  reject: (id: string | number, rejection_reason: string) => resourceAction<ReferralRedemption>("referral-redemptions", id, "reject", { rejection_reason }, { status: "rejected", rejection_reason }),
  credit: (id: string | number) => resourceAction<ReferralRedemption>("referral-redemptions", id, "credit", {}, { status: "credited", wallet_transaction_id: `TXN-${Date.now()}` }),
};
