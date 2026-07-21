import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { withdrawalsApi } from "../api/withdrawals";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, IconButton, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { WithdrawalRequest, SelectFilter } from "../types";

const WithdrawalsPage = () => {
  const client = useQueryClient();
  const [action, setAction] = useState<{ row: WithdrawalRequest; mode: "approve" | "reject" | "complete" } | null>(null);
  
  const mutation = useMutation({
    mutationFn: (variables: { reason: string; action: { row: WithdrawalRequest; mode: "approve" | "reject" | "complete" } }) => 
      variables.action.mode === "reject" ? withdrawalsApi.reject(variables.action.row.id, variables.reason) : 
      variables.action.mode === "complete" ? withdrawalsApi.complete(variables.action.row.id) : 
      withdrawalsApi.approve(variables.action.row.id),
    
    // 1. Snapshot and Optimistically update
    onMutate: async ({ action }) => {
      const { row, mode } = action;
      
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await client.cancelQueries({ queryKey: ["withdrawals"] });

      // Snapshot the previous data for rollback
      const previousData = client.getQueriesData({ queryKey: ["withdrawals"] });

      // Optimistically update the cache for all pagination pages
      client.setQueriesData({ queryKey: ["withdrawals"] }, (oldData: any) => {
        if (!oldData?.data) return oldData;
        const targetStatus = mode === "reject" ? "rejected" : mode === "complete" ? "completed" : "approved";
        return {
          ...oldData,
          data: oldData.data.map((r: WithdrawalRequest) => 
            r.id === row.id ? { ...r, status: targetStatus } : r
          ),
        };
      });

      // Return context for rollback
      return { previousData };
    },

    // 2. Rollback on failure
    onError: (err, variables, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          client.setQueryData(queryKey, data);
        });
      }
      toast.error("Failed to update status. Reverted change.");
    },

    // 3. Background sync on settle
    onSettled: () => {
      client.invalidateQueries({ queryKey: ["withdrawals"] });
      setAction(null);
    },

    onSuccess: () => { 
      toast.success("Withdrawal request updated"); 
    },
  });

  const columns = [
    { key: "id", label: "Request ID" }, 
    { key: "user", label: "Creator", render: (row: WithdrawalRequest) => <PersonCell name={row.user} userId={row.user_id as number} /> }, 
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
        onConfirm={(reason) => mutation.mutate({ reason, action: action! })} 
        loading={mutation.isPending} 
      />
    </div>
  );
};

export default WithdrawalsPage;
