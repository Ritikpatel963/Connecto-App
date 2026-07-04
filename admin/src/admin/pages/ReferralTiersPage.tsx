import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { referralTiersApi } from "../api/referrals";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { IconButton, MoneyCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ThemeModal from "../components/ThemeModal";
import { BaseRecord } from "../types";

const empty = { tier_name: "", min_referrals: 1, reward_amount: 0, is_active: true };

const ReferralTiersPage = () => {
  const client = useQueryClient();
  const [editing, setEditing] = useState<BaseRecord | null | "new">(null);
  const [deleting, setDeleting] = useState<BaseRecord | null>(null);
  const [form, setForm] = useState(empty);
  const save = useMutation({ mutationFn: () => editing === "new" ? referralTiersApi.create(form) : referralTiersApi.update(editing!.id, form), onSuccess: () => { toast.success("Referral tier saved"); setEditing(null); client.invalidateQueries({ queryKey: ["referral-tiers"] }); } });
  const remove = useMutation({ mutationFn: () => referralTiersApi.remove(deleting!.id), onSuccess: () => { toast.success("Referral tier deleted"); setDeleting(null); client.invalidateQueries({ queryKey: ["referral-tiers"] }); } });
  const open = (row?: BaseRecord) => { setEditing(row || "new"); setForm(row ? { tier_name: String(row.tier_name), min_referrals: Number(row.min_referrals), reward_amount: Number(row.reward_amount), is_active: Boolean(row.is_active) } : empty); };
  const columns = [{ key: "tier_name", label: "Tier" }, { key: "min_referrals", label: "Min referrals" }, { key: "reward_amount", label: "Reward", render: (row: BaseRecord) => <MoneyCell value={row.reward_amount} /> }, { key: "is_active", label: "Status", render: (row: BaseRecord) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> }];
  return <div className="user-management-page referral-program-page referral-tiers-page"><PageHeader title="Referral Tiers" description="Configure reward thresholds in ascending referral order." icon="solar:cup-star-outline" actions={<button className="btn btn-primary-600" onClick={() => open()}>Add tier</button>} />
    <AdminDataTable<BaseRecord> queryKey={["referral-tiers"]} queryFn={referralTiersApi.list} columns={columns} initialSort={{ key: "min_referrals", direction: "asc" }} renderActions={(row) => <><IconButton icon="solar:pen-outline" title="Edit tier" onClick={() => open(row)} /><IconButton icon="solar:trash-bin-trash-outline" title="Delete tier" tone="danger" onClick={() => setDeleting(row)} /></>} />
    <ThemeModal open={Boolean(editing)} title={editing === "new" ? "Add referral tier" : "Edit referral tier"} onClose={() => setEditing(null)} footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary-600" disabled={!form.tier_name || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save tier"}</button></>}><div className="row gy-3"><div className="col-12"><label className="form-label">Tier name</label><input className="form-control" value={form.tier_name} onChange={(e) => setForm({ ...form, tier_name: e.target.value })} /></div><div className="col-md-6"><label className="form-label">Minimum referrals</label><input type="number" min="1" className="form-control" value={form.min_referrals} onChange={(e) => setForm({ ...form, min_referrals: Number(e.target.value) })} /></div><div className="col-md-6"><label className="form-label">Reward amount</label><input type="number" min="0" className="form-control" value={form.reward_amount} onChange={(e) => setForm({ ...form, reward_amount: Number(e.target.value) })} /></div><div className="col-12"><label className="d-flex align-items-center gap-2"><input type="checkbox" className="form-check-input mt-0" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active tier</label></div></div></ThemeModal>
    <ActionModal open={Boolean(deleting)} title="Delete referral tier" description={deleting ? `Delete ${deleting.tier_name}? Existing redemption history remains on the server.` : ""} confirmLabel="Delete tier" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => remove.mutate()} loading={remove.isPending} />
  </div>;
};
export default ReferralTiersPage;
