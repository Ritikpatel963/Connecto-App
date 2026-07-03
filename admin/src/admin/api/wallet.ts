import { BaseRecord, WalletTransaction } from "../types";
import { resourceAction } from "./client";
import { createResourceApi } from "./resource";
export const walletsApi = createResourceApi<BaseRecord>("wallets");
const base = createResourceApi<WalletTransaction>("wallet-transactions");
export const walletTransactionsApi = {
  ...base,
  approve: (id: string | number) => resourceAction<WalletTransaction>("wallet-transactions", id, "approve", {}, { verification_status: "verified", reviewed_by_admin_id: 1, reviewed_at: new Date().toISOString() }),
  reject: (id: string | number, rejection_reason: string) => resourceAction<WalletTransaction>("wallet-transactions", id, "reject", { rejection_reason }, { verification_status: "rejected", reviewed_by_admin_id: 1, reviewed_at: new Date().toISOString(), rejection_reason }),
};
