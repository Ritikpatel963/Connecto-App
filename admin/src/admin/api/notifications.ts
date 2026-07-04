import { request } from "./client";
import { BaseRecord } from "../types";

export type NotificationTone = "primary" | "warning" | "success" | "danger" | "info";

export interface AdminNotification extends BaseRecord {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  tone: NotificationTone;
  to: string;
  is_read: boolean;
}

let mockNotifications: AdminNotification[] = [
  { id: 1, title: "New ID verification submitted", message: "Kabir Singh submitted an Aadhaar document.", time: "5 min ago", icon: "solar:shield-user-outline", tone: "warning", to: "/verifications/id", is_read: false },
  { id: 2, title: "Wallet recharge awaiting approval", message: "Ananya Rao uploaded a payment receipt.", time: "12 min ago", icon: "solar:wallet-money-outline", tone: "info", to: "/wallet/manual-approvals", is_read: false },
  { id: 3, title: "Referral redemption requested", message: "Meera Kapoor requested a referral payout.", time: "24 min ago", icon: "solar:gift-outline", tone: "primary", to: "/referrals/redemptions", is_read: false },
  { id: 4, title: "New user report received", message: "A safety report requires admin review.", time: "38 min ago", icon: "solar:danger-triangle-outline", tone: "danger", to: "/users", is_read: false },
  { id: 5, title: "Voice verification completed", message: "Aarav Mehta passed voice verification.", time: "1 hour ago", icon: "solar:microphone-3-outline", tone: "success", to: "/verifications/voice", is_read: false },
  { id: 6, title: "New rating submitted", message: "A low-rating review was added after a call.", time: "2 hours ago", icon: "solar:star-outline", tone: "warning", to: "/ratings", is_read: false },
  { id: 7, title: "Admin role updated", message: "Moderator permissions were changed.", time: "3 hours ago", icon: "solar:user-shield-outline", tone: "info", to: "/admin-access/roles", is_read: false },
  { id: 8, title: "Call requires review", message: "A failed call was flagged for inspection.", time: "4 hours ago", icon: "solar:phone-calling-outline", tone: "danger", to: "/calls", is_read: false },
];

const cloneNotifications = () => mockNotifications.map((notification) => ({ ...notification }));

export const notificationsApi = {
  list: () => request<AdminNotification[]>({ url: "/notifications", method: "GET" }, cloneNotifications),
  markRead: (id: number) => request<AdminNotification>(
    { url: `/notifications/${id}`, method: "PATCH", data: { is_read: true } },
    () => {
      mockNotifications = mockNotifications.map((notification) => notification.id === id ? { ...notification, is_read: true } : notification);
      return { ...mockNotifications.find((notification) => notification.id === id)! };
    }
  ),
  markAllRead: () => request<AdminNotification[]>(
    { url: "/notifications/read-all", method: "PATCH" },
    () => {
      mockNotifications = mockNotifications.map((notification) => ({ ...notification, is_read: true }));
      return cloneNotifications();
    }
  ),
};

