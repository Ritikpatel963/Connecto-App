import { BaseRecord, WalletTransaction } from "../types";
import { resourceAction } from "./client";
import { createResourceApi } from "./resource";
import { supabase } from "../../lib/supabase";

export const walletsApi = createResourceApi<BaseRecord>("wallets");
const base = createResourceApi<WalletTransaction>("wallet-transactions");

export const walletTransactionsApi = {
  ...base,
  list: async (params: any) => {
    const result = await base.list(params);
    const userIds = result.data.map(t => t.wallet_id).filter((val, idx, arr) => arr.indexOf(val) === idx);
    if (userIds.length > 0) {
      const { data: users } = await supabase.from('users').select('id, name').in('id', userIds);
      const userMap = (users || []).reduce((acc: any, u: any) => ({...acc, [u.id]: u.name}), {});
      result.data = result.data.map((t: any) => ({...t, user_name: userMap[t.wallet_id]}));
    }
    return result;
  },
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
    
    // Exact match for package or fallback to base conversion
    const pkg = coinPackages?.find(p => p.price === Number(row.amount));
    const defaultCoins = Math.floor(Number(row.amount || 0) / conversionRate);
    const finalCoins = pkg ? pkg.coins : defaultCoins;

    if (wallet?.id) {
      await supabase.from('wallets').update({ balance: currentBalance + finalCoins }).eq('id', wallet.id);
    } else {
      await supabase.from('wallets').insert({ id: targetId, user_id: row.wallet_id, balance: finalCoins });
    }

    return result;
  },
  reject: (id: string | number, rejection_reason: string) => resourceAction<WalletTransaction>("wallet-transactions", id, "reject", { rejection_reason }, { verification_status: "rejected", reviewed_at: new Date().toISOString(), rejection_reason }),
};
