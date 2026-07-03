import { CurrentAdmin } from "../types";
import { request } from "./client";

export interface DashboardMetrics {
  total_users: number;
  online_now: number;
  pending_verifications: number;
  pending_wallet_approvals: number;
  pending_referral_redemptions: number;
  revenue_today: number;
}

export const dashboardApi = {
  metrics: () => request<DashboardMetrics>(
    { url: "/dashboard", method: "GET" },
    () => ({ total_users: 24892, online_now: 1284, pending_verifications: 8, pending_wallet_approvals: 3, pending_referral_redemptions: 4, revenue_today: 486240 })
  ),
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
