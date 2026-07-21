export type Id = string | number;
export type SortDirection = "asc" | "desc";

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  filters?: Record<string, string | number | boolean | undefined>;
}

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface BaseRecord {
  id: Id;
  [key: string]: unknown;
}

export type AdminPermission =
  | "verify_id"
  | "verify_voice"
  | "approve_wallet_recharge"
  | "approve_referral_redemption"
  | "manage_users"
  | "manage_admins";

export interface CurrentAdmin {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: AdminPermission[];
}

export interface User extends BaseRecord {
  id: number;
  name: string;
  phone_number: string;
  age: number;
  gender: "male" | "female" | "other";
  country: string;
  state: string;
  city: string;
  profile_image_url?: string;
  is_online: boolean;
  call_rate: number;
  call_package_id?: number | string;
  average_rating: number;
  is_id_verified: boolean;
  is_voice_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Verification extends BaseRecord {
  user: string;
  phone_number?: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  rejection_reason?: string;
  reviewed_by_admin?: string;
  reviewed_at?: string;
  id_image_url?: string;
  voice_audio_url?: string;
  document?: string;
  sample?: string;
}

export interface CallRecord extends BaseRecord {
  caller: string;
  receiver: string;
  duration_seconds: number;
  rate_per_min_charged: number;
  total_cost: number;
  status: "initiated" | "ongoing" | "completed" | "missed" | "rejected" | "failed";
  created_at: string;
}

export interface WalletTransaction extends BaseRecord {
  wallet_id: Id;
  transaction_type: "recharge" | "call_deduction" | "refund" | "referral_reward";
  amount: number;
  payment_method?: "razorpay" | "manual_upload";
  payment_screenshot_url?: string;
  verification_status: "pending" | "verified" | "rejected";
  reviewed_by_admin_id?: number;
  reviewed_at?: string;
  created_at: string;
}

export interface ReferralRedemption extends BaseRecord {
  user: string;
  tier: string;
  qualified_referrals_at_request: number;
  reward_amount: number;
  status: "pending" | "approved" | "rejected" | "credited";
  wallet_transaction_id?: Id;
  requested_at: string;
}

export interface Subscription extends BaseRecord {
  id: number;
  user_id: number;
  plan_id: string;
  provider: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "expired" | "refunded";
  current_period_start?: string;
  current_period_end: string;
  trial_ends_at?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string; phone_number: string } | null;
}

export interface SubscriptionStats {
  snapshot_date: string | null;
  active_count: number;
  trial_count: number;
  churned_count: number;
  revenue: number;
}

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  hideable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface SelectFilter {
  key: string;
  label: string;
  options: Array<{ label: string; value: string }>;
}

export interface CallRatePackage extends BaseRecord {
  id: number | string;
  name: string;
  coins: number;
  price: number;
  currency?: string;
  status: "active" | "inactive";
  billing_unit?: "second" | "minute" | "hour";
  created_at: string;
}

export interface CoinPackage extends BaseRecord {
  id: number | string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface WithdrawalRequest extends BaseRecord {
  id: string | number;
  user: string;
  amount_coins: number;
  amount_fiat: number;
  currency: string;
  payment_method: string;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
}

export interface FavoriteRecord extends BaseRecord {
  id: string | number;
  user_id: number;
  target_user_id: number;
  created_at: string;
  user?: User; // Optional populated user
  target_user?: User; // Optional populated target user
}
