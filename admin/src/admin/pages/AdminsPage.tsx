import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminsApi, rolesApi } from "../api/rbac";
import { supabase } from "../../lib/supabase";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, IconButton, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ThemeModal from "../components/ThemeModal";
import { BaseRecord } from "../types";

const empty = { name: "", email: "", password: "", role_id: 0, is_active: true };

const AdminsPage = () => {
  const client = useQueryClient();
  const [editing, setEditing] = useState<BaseRecord | null | "new">(null);
  const [deleting, setDeleting] = useState<BaseRecord | null>(null);
  const [form, setForm] = useState(empty);

  const { data: rolesData } = useQuery({ queryKey: ["roles"], queryFn: () => rolesApi.list({ page: 1, pageSize: 100 }) });
  const roles: BaseRecord[] = rolesData?.data || [];

  const open = (row?: BaseRecord) => {
    setEditing(row || "new");
    setForm(row
      ? { name: String(row.name), email: String(row.email), password: "", role_id: Number(row.role_id), is_active: Boolean(row.is_active) }
      : { ...empty, role_id: roles[0] ? Number(roles[0].id) : 0 }
    );
  };

  const save = useMutation({
    mutationFn: async () => {
      if (editing === "new") {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (authError) throw authError;
        const authUserId = authData.user?.id;
        if (!authUserId) throw new Error("Failed to create auth user");
        return adminsApi.create({ name: form.name, email: form.email, role_id: form.role_id, is_active: form.is_active, auth_user_id: authUserId });
      }
      return adminsApi.update((editing as BaseRecord).id, { name: form.name, role_id: form.role_id, is_active: form.is_active });
    },
    onSuccess: () => { toast.success("Admin saved"); setEditing(null); client.invalidateQueries({ queryKey: ["admins"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: () => adminsApi.remove(deleting!.id),
    onSuccess: () => { toast.success("Admin deleted"); setDeleting(null); client.invalidateQueries({ queryKey: ["admins"] }); },
  });

  const columns = [
    { key: "name", label: "Admin", render: (row: BaseRecord) => <PersonCell name={row.name} subtitle={row.email} /> },
    { key: "role", label: "Role" },
    { key: "is_active", label: "Status", render: (row: BaseRecord) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
    { key: "last_login_at", label: "Last login", render: (row: BaseRecord) => <DateCell value={row.last_login_at} /> },
  ];

  return <div className="user-management-page admin-access-page admins-page">
    <PageHeader title="Admins" description="Manage staff accounts and role assignments." icon="solar:user-shield-outline" actions={<button className="btn btn-primary-600" onClick={() => open()}>Add admin</button>} />
    <AdminDataTable<BaseRecord> queryKey={["admins"]} queryFn={adminsApi.list} columns={columns} renderActions={(row) => <><IconButton icon="solar:pen-outline" title="Edit admin" onClick={() => open(row)} /><IconButton icon="solar:trash-bin-trash-outline" title="Delete admin" tone="danger" onClick={() => setDeleting(row)} /></>} />
    <ThemeModal open={Boolean(editing)} title={editing === "new" ? "Add admin" : "Edit admin"} onClose={() => setEditing(null)} footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary-600" disabled={!form.name || !form.email || (editing === "new" && !form.password) || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save admin"}</button></>}>
      <div className="row gy-3">
        <div className="col-md-6"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="col-md-6"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} disabled={editing !== "new"} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        {editing === "new" && <div className="col-12"><label className="form-label">Temporary password <span className="text-danger">*</span></label><input type="password" className="form-control" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" /></div>}
        <div className="col-12"><label className="form-label">Role</label>
          <select className="form-select" value={form.role_id} onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}>
            {roles.map((r) => <option key={r.id as string} value={r.id as string}>{String(r.name)}</option>)}
          </select>
        </div>
        <div className="col-12"><label className="d-flex gap-2 align-items-center"><input type="checkbox" className="form-check-input mt-0" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active account</label></div>
      </div>
    </ThemeModal>
    <ActionModal open={Boolean(deleting)} title="Delete admin" description={deleting ? `Delete ${deleting.name}? They will lose access immediately.` : ""} confirmLabel="Delete admin" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => remove.mutate()} loading={remove.isPending} />
  </div>;
};
export default AdminsPage;
