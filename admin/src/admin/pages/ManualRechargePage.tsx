import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { toast } from "react-toastify";
import { walletTransactionsApi } from "../api/wallet";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, IconButton, MoneyCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { WalletTransaction } from "../types";

const ManualRechargePage = () => {
  const client = useQueryClient();
  const [action, setAction] = useState<{ row: WalletTransaction; mode: "view" | "approve" | "reject" } | null>(null);
  const mutation = useMutation({
    mutationFn: (variables: { reason: string; action: { row: WalletTransaction; mode: "view" | "approve" | "reject" } }) => 
      variables.action.mode === "reject" ? walletTransactionsApi.reject(variables.action.row.id, variables.reason) : walletTransactionsApi.approve(variables.action.row),
    onMutate: async ({ action }) => {
      const { row, mode } = action;
      
      await client.cancelQueries({ queryKey: ["manual-recharges"] });
      const previousData = client.getQueriesData({ queryKey: ["manual-recharges"] });

      client.setQueriesData({ queryKey: ["manual-recharges"] }, (oldData: any) => {
        if (!oldData?.data) return oldData;
        const targetStatus = mode === "reject" ? "rejected" : "verified";
        return {
          ...oldData,
          data: oldData.data.map((r: WalletTransaction) => 
            r.id === row.id ? { ...r, verification_status: targetStatus } : r
          ),
        };
      });

      return { previousData };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          client.setQueryData(queryKey, data);
        });
      }
      toast.error(`Failed to update recharge request: ${err?.message || err}`);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: ["manual-recharges"] });
      setAction(null);
    },
    onSuccess: () => { 
      toast.success("Recharge request updated"); 
    },
  });

  const { data: coinPackages } = useQuery({ queryKey: ["coin-packages"], queryFn: async () => { const res = await supabase.from('coin_packages').select('*').eq('is_active', true); return res.data || []; } });

  const columns = [
    { key: "id", label: "Request" }, { key: "wallet_id", label: "Wallet" },
    { key: "amount", label: "Amount", render: (row: WalletTransaction) => {
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
    { key: "payment_method", label: "Method" },
    { key: "verification_status", label: "Status", render: (row: WalletTransaction) => <StatusBadge value={row.verification_status} /> },
    { key: "created_at", label: "Submitted", render: (row: WalletTransaction) => <DateCell value={row.created_at} /> },
  ];

  const getDisclaimer = () => {
    if (!action || !coinPackages) return null;
    const pkg = coinPackages.find((p: any) => p.price === Number(action.row.amount));
    const baseRule = coinPackages[0];
    const conversionRate = (baseRule && baseRule.coins > 0) ? (baseRule.price / baseRule.coins) : 1;
    const defaultCoins = Math.floor(Number(action.row.amount || 0) / conversionRate);
    if (pkg && pkg.coins > defaultCoins) {
      return <div className="p-12 mb-16 mt-16 bg-success-50 text-success-700 radius-8 text-sm fw-medium border border-success-200">⚠️ Special Offer: Approving this will credit {pkg.coins} Coins (includes {pkg.coins - defaultCoins} bonus coins)!</div>;
    }
    return <div className="p-12 mb-16 mt-16 bg-primary-50 text-primary-700 radius-8 text-sm fw-medium border border-primary-200">Approving this will credit {defaultCoins} Coins.</div>;
  };

  return <div className="user-management-page wallet-page manual-recharge-page"><PageHeader title="Manual Recharge Approvals" description="Verify uploaded payment screenshots before crediting wallets." icon="solar:wallet-money-outline" />
    <AdminDataTable<WalletTransaction> queryKey={["manual-recharges"]} queryFn={(params) => walletTransactionsApi.list({ ...params, filters: { ...params.filters, payment_method: "manual_upload" } })} columns={columns} initialSort={{ key: "created_at", direction: "desc" }} renderActions={(row) => <>
      <IconButton icon="solar:gallery-wide-outline" title="View screenshot" onClick={() => setAction({ row, mode: "view" })} />
      {row.verification_status === "pending" && <><IconButton icon="solar:check-circle-outline" title="Approve" tone="success" onClick={() => setAction({ row, mode: "approve" })} /><IconButton icon="solar:close-circle-outline" title="Reject" tone="danger" onClick={() => setAction({ row, mode: "reject" })} /></>}
    </>} />
    <ActionModal open={Boolean(action)} title={action?.mode === "view" ? "Payment screenshot" : action?.mode === "approve" ? "Approve recharge" : "Reject recharge"} description={action ? `${action.row.id} \u00B7 \u20B9${action.row.amount}` : ""} confirmLabel={action?.mode === "view" ? "Close" : action?.mode === "approve" ? "Approve & credit" : "Reject"} tone={action?.mode === "reject" ? "danger" : "success"} requireReason={action?.mode === "reject"} onClose={() => setAction(null)} onConfirm={(reason) => action?.mode === "view" ? setAction(null) : mutation.mutate({ reason, action: action! })} loading={mutation.isPending}>
      {action && <div className="bg-neutral-50 radius-12 text-center py-40 flex-column align-items-center"><span className="w-64-px h-64-px rounded-circle bg-primary-50 text-primary-600 d-inline-flex align-items-center justify-content-center mb-12"><span className="text-2xl">{"\u20B9"}</span></span><p className="fw-semibold mb-4">Uploaded payment proof</p>{action.row.payment_screenshot_url && action.row.payment_screenshot_url !== 'test' ? <div className="w-100 d-flex flex-column align-items-center justify-content-center"><img src={action.row.payment_screenshot_url} alt="Payment proof" style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8, marginTop: 12, marginBottom: 8 }} onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x200?text=Image+Load+Failed'; }} /><a href={action.row.payment_screenshot_url} target="_blank" rel="noreferrer" className="text-sm fw-medium text-primary-600 mb-12" download="payment-proof">Download / Open Full Size</a></div> : <p className="text-secondary mt-12 mb-12">No screenshot available</p>}{getDisclaimer()}<p className="text-xs text-secondary-light mt-12 mb-0">Approval will be tied to the current admin ID.</p></div>}
    </ActionModal>
  </div>;
};
export default ManualRechargePage;
