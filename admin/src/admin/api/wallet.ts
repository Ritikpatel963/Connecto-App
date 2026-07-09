import { BaseRecord, WalletTransaction } from "../types";
import { resourceAction } from "./client";
import { createResourceApi } from "./resource";
import { supabase } from "../../lib/supabase";

export const walletsApi = createResourceApi<BaseRecord>("wallets");
const base = createResourceApi<WalletTransaction>("wallet-transactions");

export const walletTransactionsApi = {
  ...base,
  approve: async (row: WalletTransaction) => {
    // 1. Mark transaction as verified
    await resourceAction<WalletTransaction>("wallet-transactions", row.id, "approve", {}, { verification_status: "verified", reviewed_at: new Date().toISOString() });
    
    // 2. Add amount to wallet balance
    // Ponytail approach: Fetch current balance, add amount, then update.
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', row.wallet_id).single();
    const currentBalance = wallet?.balance || 0;
    
    const { error } = await supabase.from('wallets').update({ balance: currentBalance + row.amount }).eq('id', row.wallet_id);
    if (error) {
       // If wallet doesn't exist, try inserting it
       await supabase.from('wallets').insert({ id: row.wallet_id, user_id: row.wallet_id, balance: row.amount }).select().single();
    }
  },
  reject: (id: string | number, rejection_reason: string) => resourceAction<WalletTransaction>("wallet-transactions", id, "reject", { rejection_reason }, { verification_status: "rejected", reviewed_at: new Date().toISOString(), rejection_reason }),
};
