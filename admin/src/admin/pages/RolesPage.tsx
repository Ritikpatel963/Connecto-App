import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { rolesApi } from "../api/rbac";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { IconButton } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import ThemeModal from "../components/ThemeModal";
import { BaseRecord } from "../types";

const RolesPage = () => {
  const client = useQueryClient();
  const [editing, setEditing] = useState<BaseRecord | null | "new">(null);
  const [deleting, setDeleting] = useState<BaseRecord | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const open = (row?: BaseRecord) => { setEditing(row || "new"); setForm(row ? { name: String(row.name), description: String(row.description) } : { name: "", description: "" }); };
  const save = useMutation({ mutationFn: () => editing === "new" ? rolesApi.create(form) : rolesApi.update(editing!.id, form), onSuccess: () => { toast.success("Role saved"); setEditing(null); client.invalidateQueries({ queryKey: ["roles"] }); } });
  const remove = useMutation({ mutationFn: () => rolesApi.remove(deleting!.id), onSuccess: () => { toast.success("Role deleted"); setDeleting(null); client.invalidateQueries({ queryKey: ["roles"] }); } });
  const columns = [{ key: "name", label: "Role" }, { key: "description", label: "Description", className: "min-w-240-px" }, { key: "permissions", label: "Permissions" }, { key: "admins", label: "Admins" }];
  return <><PageHeader title="Roles" description="Create role bundles for admin permissions." icon="solar:users-group-two-rounded-outline" actions={<button className="btn btn-primary-600" onClick={() => open()}>Create role</button>} /><AdminDataTable<BaseRecord> queryKey={["roles"]} queryFn={rolesApi.list} columns={columns} renderActions={(row) => <><IconButton icon="solar:pen-outline" title="Edit role" onClick={() => open(row)} /><IconButton icon="solar:trash-bin-trash-outline" title="Delete role" tone="danger" onClick={() => setDeleting(row)} /></>} />
    <ThemeModal open={Boolean(editing)} title={editing === "new" ? "Create role" : "Edit role"} onClose={() => setEditing(null)} footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary-600" disabled={!form.name || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save role"}</button></>}><label className="form-label">Role name</label><input className="form-control mb-16" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><label className="form-label">Description</label><textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></ThemeModal>
    <ActionModal open={Boolean(deleting)} title="Delete role" description={deleting ? `Delete ${deleting.name}? Existing admins must be reassigned by the API.` : ""} confirmLabel="Delete role" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => remove.mutate()} loading={remove.isPending} />
  </>;
};
export default RolesPage;
