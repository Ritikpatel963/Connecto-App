import { CurrentAdmin } from "../types";
import { request } from "./client";
import { supabase } from "../../lib/supabase";

export interface DashboardMetrics {
  total_users: number;
  online_now: number;
  pending_verifications: number;
  pending_wallet_approvals: number;
  pending_referral_redemptions: number;
  revenue_today: number;
}

export const dashboardApi = {
  metrics: async (): Promise<DashboardMetrics> => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [users, online, ids, voices, wallets, redemptions, revenue] = await Promise.all([
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("users").select("id", { count: "exact", head: true }).eq("is_online", true),
      supabase.from("id_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("voice_verifications").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("wallet_transactions").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
      supabase.from("referral_redemptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("wallet_transactions").select("amount").gte("created_at", today.toISOString()).eq("verification_status", "verified"),
    ]);

    const failed = [users, online, ids, voices, wallets, redemptions, revenue].find((result) => result.error);
    if (failed?.error) throw failed.error;

    return {
      total_users: users.count || 0,
      online_now: online.count || 0,
      pending_verifications: (ids.count || 0) + (voices.count || 0),
      pending_wallet_approvals: wallets.count || 0,
      pending_referral_redemptions: redemptions.count || 0,
      revenue_today: (revenue.data || []).reduce((total, row) => total + Number(row.amount || 0), 0),
    };
  },
  currentAdmin: () => request<CurrentAdmin>(
    { url: "/me", method: "GET" },
    () => ({
      id: 1,
      name: "Neha Verma",
      email: "neha@connecto.app",
      role: "Super admin",
      permissions: ["verify_id", "verify_voice", "approve_wallet_recharge", "approve_referral_redemption", "manage_users", "manage_admins"],
    })
  ),
};
