import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { walletTransactionsApi } from "../api/wallet";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, MoneyCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { SelectFilter, WalletTransaction } from "../types";

const filters: SelectFilter[] = [
  { key: "transaction_type", label: "Type", options: ["recharge", "call_deduction", "refund", "referral_reward"].map((value) => ({ label: value.replaceAll("_", " "), value })) },
  { key: "verification_status", label: "Status", options: ["pending", "verified", "rejected"].map((value) => ({ label: value, value })) },
];

const WalletTransactionsPage = () => {
  const queryClient = useQueryClient();
  const { data: coinPackages } = useQuery({ queryKey: ["coin-packages"], queryFn: async () => { const res = await supabase.from('coin_packages').select('*').eq('is_active', true); return res.data || []; } });

  useEffect(() => {
    const channel = supabase
      .channel('admin_wallet_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const columns = [
    { key: "id", label: "Transaction", render: (row: any) => <span className="text-secondary fw-medium">#TRX-{row.id}</span> }, 
    { key: "wallet_id", label: "User", render: (row: any) => (
      <Link to={`/users/${row.wallet_id}`} className="fw-semibold text-primary text-decoration-none">
        {row.user_name || `User ${row.wallet_id}`}
      </Link>
    )},
    { key: "transaction_type", label: "Type", render: (row: WalletTransaction) => <StatusBadge value={row.transaction_type} /> },
    { key: "amount", label: "Amount", render: (row: WalletTransaction) => {
        if (row.transaction_type !== "recharge") return <MoneyCell value={row.amount} />;
        const pkg = coinPackages?.find((p: any) => p.price === Number(row.amount));
        const baseRule = coinPackages?.[0];
        const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
        const defaultCoins = Math.floor(Number(row.amount || 0) / conversionRate);
        const isSpecial = pkg && pkg.coins > defaultCoins;
        return (
          <div className="d-flex flex-column">
            <MoneyCell value={row.amount} />
            {isSpecial && <span className="text-xs fw-bold mt-4" style={{ color: '#2dd4a8' }}>Special Offer ({pkg.coins} Coins)</span>}
          </div>
        );
    }},
    { key: "payment_method", label: "Method / Txn ID", render: (row: WalletTransaction) => {
      const url = String(row.payment_screenshot_url || "");
      if (url.startsWith("admin_note:")) {
        return (
          <div className="d-flex flex-column gap-1">
            <span className="text-capitalize text-secondary">System Adjustment</span>
            <span className="text-primary-600 text-xs fw-medium">{url.replace("admin_note:", "").trim()}</span>
          </div>
        );
      }
      if (!row.payment_method) return "-";
      const parts = String(row.payment_method).split(':');
      const gateway = parts[0].replace('_', ' ');
      const txnId = parts.slice(1).join(':'); // In case txnId has colons
      return (
        <div className="d-flex flex-column gap-1">
          <span className="text-capitalize">{gateway}</span>
          {txnId && <span className="text-secondary text-xs font-monospace">{txnId}</span>}
        </div>
      );
    }},
    { key: "verification_status", label: "Verification", render: (row: WalletTransaction) => <StatusBadge value={row.verification_status} /> },
    { key: "created_at", label: "Created", render: (row: WalletTransaction) => <DateCell value={row.created_at} /> },
  ];
  return <div className="user-management-page wallet-page"><PageHeader title="Wallet Transactions" description="All recharge, deduction, refund and referral reward movements." icon="solar:card-transfer-outline" /><AdminDataTable<WalletTransaction> queryKey={["wallet-transactions"]} queryFn={walletTransactionsApi.list} columns={columns} filters={filters} initialSort={{ key: "created_at", direction: "desc" }} /></div>;
};
export default WalletTransactionsPage;
