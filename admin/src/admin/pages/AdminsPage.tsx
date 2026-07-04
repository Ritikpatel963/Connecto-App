import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminsApi } from "../api/rbac";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, IconButton, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ThemeModal from "../components/ThemeModal";
import { BaseRecord } from "../types";

const empty = { name: "", email: "", role: "Moderator", role_id: 2, is_active: true };

const AdminsPage = () => {
  const client = useQueryClient();
  const [editing, setEditing] = useState<BaseRecord | null | "new">(null);
  const [deleting, setDeleting] = useState<BaseRecord | null>(null);
  const [form, setForm] = useState(empty);
  const open = (row?: BaseRecord) => { setEditing(row || "new"); setForm(row ? { name: String(row.name), email: String(row.email), role: String(row.role), role_id: Number(row.role_id), is_active: Boolean(row.is_active) } : empty); };
  const save = useMutation({ mutationFn: () => editing === "new" ? adminsApi.create({ ...form, status: form.is_active ? "active" : "inactive" }) : adminsApi.update(editing!.id, { ...form, status: form.is_active ? "active" : "inactive" }), onSuccess: () => { toast.success("Admin saved"); setEditing(null); client.invalidateQueries({ queryKey: ["admins"] }); } });
  const remove = useMutation({ mutationFn: () => adminsApi.remove(deleting!.id), onSuccess: () => { toast.success("Admin deleted"); setDeleting(null); client.invalidateQueries({ queryKey: ["admins"] }); } });
  const columns = [{ key: "name", label: "Admin", render: (row: BaseRecord) => <PersonCell name={row.name} subtitle={row.email} /> }, { key: "role", label: "Role" }, { key: "is_active", label: "Status", render: (row: BaseRecord) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> }, { key: "last_login_at", label: "Last login", render: (row: BaseRecord) => <DateCell value={row.last_login_at} /> }];
  return <div className="user-management-page admin-access-page admins-page"><PageHeader title="Admins" description="Manage staff accounts and role assignments." icon="solar:user-shield-outline" actions={<button className="btn btn-primary-600" onClick={() => open()}>Add admin</button>} />
    <AdminDataTable<BaseRecord> queryKey={["admins"]} queryFn={adminsApi.list} columns={columns} renderActions={(row) => <><IconButton icon="solar:pen-outline" title="Edit admin" onClick={() => open(row)} /><IconButton icon="solar:trash-bin-trash-outline" title="Delete admin" tone="danger" onClick={() => setDeleting(row)} /></>} />
    <ThemeModal open={Boolean(editing)} title={editing === "new" ? "Add admin" : "Edit admin"} onClose={() => setEditing(null)} footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary-600" disabled={!form.name || !form.email || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save admin"}</button></>}><div className="row gy-3"><div className="col-md-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="col-md-6"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div><div className="col-12"><label className="form-label">Role</label><select className="form-select" value={form.role_id} onChange={(e) => { const role_id = Number(e.target.value); setForm({ ...form, role_id, role: role_id === 1 ? "Super admin" : role_id === 2 ? "Moderator" : "Finance admin" }); }}><option value={1}>Super admin</option><option value={2}>Moderator</option><option value={3}>Finance admin</option></select></div><div className="col-12"><label className="d-flex gap-2 align-items-center"><input type="checkbox" className="form-check-input mt-0" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active account</label></div></div></ThemeModal>
    <ActionModal open={Boolean(deleting)} title="Delete admin" description={deleting ? `Delete ${deleting.name}? This cannot delete the currently logged-in admin on the live API.` : ""} confirmLabel="Delete admin" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => remove.mutate()} loading={remove.isPending} />
  </div>;
};
export default AdminsPage;
