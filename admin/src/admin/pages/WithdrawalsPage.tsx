import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { withdrawalsApi } from "../api/withdrawals";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, IconButton, MoneyCell, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { WithdrawalRequest, SelectFilter } from "../types";

const WithdrawalsPage = () => {
  const client = useQueryClient();
  const [action, setAction] = useState<{ row: WithdrawalRequest; mode: "approve" | "reject" | "complete" } | null>(null);
  
  const mutation = useMutation({
    mutationFn: (reason: string) => 
      action?.mode === "reject" ? withdrawalsApi.reject(action.row.id, reason) : 
      action?.mode === "complete" ? withdrawalsApi.complete(action.row.id) : 
      withdrawalsApi.approve(action!.row.id),
    onSuccess: () => { 
      toast.success("Withdrawal request updated"); 
      setAction(null); 
      client.invalidateQueries({ queryKey: ["withdrawals"] }); 
    },
  });

  const columns = [
    { key: "id", label: "Request ID" }, 
    { key: "user", label: "Creator", render: (row: WithdrawalRequest) => <PersonCell name={row.user} /> }, 
    { key: "amount_coins", label: "Coins", render: (row: WithdrawalRequest) => <span>{row.amount_coins} coins</span> },
    { key: "amount_fiat", label: "Payout", render: (row: WithdrawalRequest) => <span>{row.currency || "INR"} {row.amount_fiat}</span> },
    { key: "payment_method", label: "Payment Method" },
    { key: "status", label: "Status", render: (row: WithdrawalRequest) => <StatusBadge value={row.status} /> },
    { key: "created_at", label: "Requested", render: (row: WithdrawalRequest) => <DateCell value={row.created_at} /> },
  ];

  const filters: SelectFilter[] = [
    { key: "status", label: "Status", options: ["pending", "approved", "rejected", "completed"].map((value) => ({ label: value.charAt(0).toUpperCase() + value.slice(1), value })) }
  ];

  return (
    <div className="withdrawals-page">
      <PageHeader 
        title="Withdrawal Requests" 
        description="Review and process coin payout requests from creators." 
        icon="solar:cash-out-outline" 
      />
      <AdminDataTable<WithdrawalRequest> 
        queryKey={["withdrawals"]} 
        queryFn={withdrawalsApi.list} 
        columns={columns} 
        filters={filters} 
        initialSort={{ key: "created_at", direction: "desc" }} 
        renderActions={(row) => (
          <>
            {row.status === "pending" && (
              <>
                <IconButton icon="solar:check-circle-outline" title="Approve" tone="success" onClick={() => setAction({ row, mode: "approve" })} />
                <IconButton icon="solar:close-circle-outline" title="Reject" tone="danger" onClick={() => setAction({ row, mode: "reject" })} />
              </>
            )}
            {row.status === "approved" && (
              <IconButton icon="solar:wallet-money-outline" title="Mark Paid" tone="success" onClick={() => setAction({ row, mode: "complete" })} />
            )}
          </>
        )} 
      />
      <ActionModal 
        open={Boolean(action)} 
        title={action?.mode === "complete" ? "Mark withdrawal complete" : action?.mode === "approve" ? "Approve withdrawal" : "Reject withdrawal"} 
        description={action ? `${action.row.user} requested ${action.row.currency} ${action.row.amount_fiat} (${action.row.amount_coins} coins) via ${action.row.payment_method}.` : ""} 
        confirmLabel={action?.mode === "complete" ? "Mark Paid" : action?.mode === "approve" ? "Approve" : "Reject"} 
        tone={action?.mode === "reject" ? "danger" : "success"} 
        requireReason={action?.mode === "reject"} 
        onClose={() => setAction(null)} 
        onConfirm={(reason) => mutation.mutate(reason)} 
        loading={mutation.isPending} 
      />
    </div>
  );
};

export default WithdrawalsPage;
