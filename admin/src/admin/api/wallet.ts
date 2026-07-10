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
    const result = await resourceAction<WalletTransaction>("wallet-transactions", row.id, "approve", {}, { verification_status: "verified", reviewed_at: new Date().toISOString() });

    // 2. Add amount to wallet balance
    // Ponytail approach: Fetch current balance, add amount, then update.
    const { data: wallet } = await supabase.from('wallets').select('id, balance').or(`id.eq.${row.wallet_id},user_id.eq.${row.wallet_id}`).maybeSingle();
    const currentBalance = wallet?.balance || 0;
    const targetId = wallet?.id || row.wallet_id;
    
    // Apply conversion rule: 
    const { data: coinPackages } = await supabase.from('coin_packages').select('*').eq('is_active', true).order('price', { ascending: true });
    const baseRule = coinPackages?.[0];
    const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
    const finalCoins = Math.floor(Number(row.amount || 0) / conversionRate);

    if (wallet?.id) {
      await supabase.from('wallets').update({ balance: currentBalance + finalCoins }).eq('id', wallet.id);
    } else {
      await supabase.from('wallets').insert({ id: targetId, user_id: row.wallet_id, balance: finalCoins });
    }

    return result;
  },
  reject: (id: string | number, rejection_reason: string) => resourceAction<WalletTransaction>("wallet-transactions", id, "reject", { rejection_reason }, { verification_status: "rejected", reviewed_at: new Date().toISOString(), rejection_reason }),
};
