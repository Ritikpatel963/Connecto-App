import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    mutationFn: (reason: string) => action?.mode === "reject" ? walletTransactionsApi.reject(action.row.id, reason) : walletTransactionsApi.approve(action!.row.id),
    onSuccess: () => { toast.success("Recharge request updated"); setAction(null); client.invalidateQueries({ queryKey: ["manual-recharges"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns = [
    { key: "id", label: "Request" }, { key: "wallet_id", label: "Wallet" },
    { key: "amount", label: "Amount", render: (row: WalletTransaction) => <MoneyCell value={row.amount} /> },
    { key: "payment_method", label: "Method" },
    { key: "verification_status", label: "Status", render: (row: WalletTransaction) => <StatusBadge value={row.verification_status} /> },
    { key: "created_at", label: "Submitted", render: (row: WalletTransaction) => <DateCell value={row.created_at} /> },
  ];

  return <div className="user-management-page wallet-page manual-recharge-page"><PageHeader title="Manual Recharge Approvals" description="Verify uploaded payment screenshots before crediting wallets." icon="solar:wallet-money-outline" />
    <AdminDataTable<WalletTransaction> queryKey={["manual-recharges"]} queryFn={(params) => walletTransactionsApi.list({ ...params, filters: { ...params.filters, payment_method: "manual_upload" } })} columns={columns} initialSort={{ key: "created_at", direction: "desc" }} renderActions={(row) => <>
      <IconButton icon="solar:gallery-wide-outline" title="View screenshot" onClick={() => setAction({ row, mode: "view" })} />
      {row.verification_status === "pending" && <><IconButton icon="solar:check-circle-outline" title="Approve" tone="success" onClick={() => setAction({ row, mode: "approve" })} /><IconButton icon="solar:close-circle-outline" title="Reject" tone="danger" onClick={() => setAction({ row, mode: "reject" })} /></>}
    </>} />
    <ActionModal open={Boolean(action)} title={action?.mode === "view" ? "Payment screenshot" : action?.mode === "approve" ? "Approve recharge" : "Reject recharge"} description={action ? `${action.row.id} \u00B7 \u20B9${action.row.amount}` : ""} confirmLabel={action?.mode === "view" ? "Close" : action?.mode === "approve" ? "Approve & credit" : "Reject"} tone={action?.mode === "reject" ? "danger" : "success"} requireReason={action?.mode === "reject"} onClose={() => setAction(null)} onConfirm={(reason) => action?.mode === "view" ? setAction(null) : mutation.mutate(reason)} loading={mutation.isPending}>
      {action && <div className="bg-neutral-50 radius-12 text-center py-40"><span className="w-64-px h-64-px rounded-circle bg-primary-50 text-primary-600 d-inline-flex align-items-center justify-content-center mb-12"><span className="text-2xl">{"\u20B9"}</span></span><p className="fw-semibold mb-4">Uploaded payment proof</p><a href={action.row.payment_screenshot_url} target="_blank" rel="noreferrer">Open screenshot</a><p className="text-xs text-secondary-light mt-12 mb-0">Approval will be tied to the current admin ID.</p></div>}
    </ActionModal>
  </div>;
};
export default ManualRechargePage;
