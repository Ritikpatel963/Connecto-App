import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { redemptionsApi } from "../api/referrals";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, IconButton, MoneyCell, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { ReferralRedemption, SelectFilter } from "../types";

const RedemptionsPage = () => {
  const client = useQueryClient();
  const [action, setAction] = useState<{ row: ReferralRedemption; mode: "approve" | "reject" | "credit" } | null>(null);
  const mutation = useMutation({
    mutationFn: (reason: string) => action?.mode === "reject" ? redemptionsApi.reject(action.row.id, reason) : action?.mode === "credit" ? redemptionsApi.credit(action.row.id) : redemptionsApi.approve(action!.row.id),
    onSuccess: () => { toast.success("Redemption updated"); setAction(null); client.invalidateQueries({ queryKey: ["redemptions"] }); },
  });
  const columns = [
    { key: "id", label: "Request" }, { key: "user", label: "User", render: (row: ReferralRedemption) => <PersonCell name={row.user} /> }, { key: "tier", label: "Tier" },
    { key: "qualified_referrals_at_request", label: "Qualified snapshot" },
    { key: "reward_amount", label: "Reward snapshot", render: (row: ReferralRedemption) => <MoneyCell value={row.reward_amount} /> },
    { key: "status", label: "Status", render: (row: ReferralRedemption) => <StatusBadge value={row.status} /> },
    { key: "requested_at", label: "Requested", render: (row: ReferralRedemption) => <DateCell value={row.requested_at} /> },
  ];
  const filters: SelectFilter[] = [{ key: "status", label: "Status", options: ["pending", "approved", "rejected", "credited"].map((value) => ({ label: value, value })) }];

  return <><PageHeader title="Referral Redemptions" description="Approve payout snapshots, then mark them credited after wallet transaction creation." icon="solar:gift-outline" />
    <AdminDataTable<ReferralRedemption> queryKey={["redemptions"]} queryFn={redemptionsApi.list} columns={columns} filters={filters} initialSort={{ key: "requested_at", direction: "desc" }} renderActions={(row) => <>
      {row.status === "pending" && <><IconButton icon="solar:check-circle-outline" title="Approve" tone="success" onClick={() => setAction({ row, mode: "approve" })} /><IconButton icon="solar:close-circle-outline" title="Reject" tone="danger" onClick={() => setAction({ row, mode: "reject" })} /></>}
      {row.status === "approved" && <IconButton icon="solar:wallet-money-outline" title="Mark credited" tone="success" onClick={() => setAction({ row, mode: "credit" })} />}
    </>} />
    <ActionModal open={Boolean(action)} title={action?.mode === "credit" ? "Credit wallet reward" : action?.mode === "approve" ? "Approve redemption" : "Reject redemption"} description={action ? `${action.row.user} requested ₹${action.row.reward_amount} with ${action.row.qualified_referrals_at_request} qualified referrals.` : ""} confirmLabel={action?.mode === "credit" ? "Create credit" : action?.mode === "approve" ? "Approve" : "Reject"} tone={action?.mode === "reject" ? "danger" : "success"} requireReason={action?.mode === "reject"} onClose={() => setAction(null)} onConfirm={(reason) => mutation.mutate(reason)} loading={mutation.isPending} />
  </>;
};
export default RedemptionsPage;
