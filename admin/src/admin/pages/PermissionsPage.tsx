import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { permissionsApi, rolePermissionsApi, rolesApi } from "../api/rbac";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { IconButton } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import { ErrorState, LoadingState } from "../components/PageStates";
import ThemeModal from "../components/ThemeModal";
import { BaseRecord } from "../types";

const PermissionsPage = () => {
  const client = useQueryClient();
  const roles = useQuery({ queryKey: ["roles-all"], queryFn: () => rolesApi.list({ page: 1, pageSize: 100 }) });
  const permissions = useQuery({ queryKey: ["permissions-all"], queryFn: () => permissionsApi.list({ page: 1, pageSize: 100 }) });
  const assignments = useQuery({ queryKey: ["role-permission-matrix"], queryFn: rolePermissionsApi.matrix });
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<BaseRecord | null | "new">(null);
  const [deleting, setDeleting] = useState<BaseRecord | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => { if (assignments.data) setChecked(new Set(assignments.data.map((item: BaseRecord) => `${item.role_id}-${item.permission_id}`))); }, [assignments.data]);
  const open = (row?: BaseRecord) => { setEditing(row || "new"); setForm(row ? { name: String(row.name), description: String(row.description) } : { name: "", description: "" }); };
  const saveMatrix = useMutation({ mutationFn: () => rolePermissionsApi.saveMatrix(Array.from(checked).map((value, index) => { const [role_id, permission_id] = value.split("-").map(Number); return { id: index + 1, role_id, permission_id }; })), onSuccess: () => toast.success("Permission matrix saved") });
  const savePermission = useMutation({ mutationFn: () => editing === "new" ? permissionsApi.create(form) : permissionsApi.update(editing!.id, form), onSuccess: () => { toast.success("Permission saved"); setEditing(null); client.invalidateQueries({ queryKey: ["permissions-all"] }); client.invalidateQueries({ queryKey: ["permissions"] }); } });
  const removePermission = useMutation({ mutationFn: () => permissionsApi.remove(deleting!.id), onSuccess: () => { toast.success("Permission deleted"); setDeleting(null); client.invalidateQueries({ queryKey: ["permissions-all"] }); client.invalidateQueries({ queryKey: ["permissions"] }); } });

  if (roles.isLoading || permissions.isLoading || assignments.isLoading) return <LoadingState label="Loading permission matrix..." />;
  if (roles.isError || permissions.isError || assignments.isError || !roles.data || !permissions.data) return <ErrorState onRetry={() => { roles.refetch(); permissions.refetch(); assignments.refetch(); }} />;

  const columns = [{ key: "name", label: "Permission" }, { key: "description", label: "Description", className: "min-w-300-px" }, { key: "roles", label: "Used by roles" }];

  return <><PageHeader title="Permissions" description="Manage permission definitions and assign them to roles." icon="solar:key-minimalistic-square-outline" actions={<button className="btn btn-primary-600" onClick={() => open()}>Add permission</button>} />
    <div className="mb-24"><AdminDataTable<BaseRecord> queryKey={["permissions"]} queryFn={permissionsApi.list} columns={columns} renderActions={(row) => <><IconButton icon="solar:pen-outline" title="Edit permission" onClick={() => open(row)} /><IconButton icon="solar:trash-bin-trash-outline" title="Delete permission" tone="danger" onClick={() => setDeleting(row)} /></>} /></div>
    <div className="card"><div className="card-header border-bottom bg-base py-16 px-24 d-flex justify-content-between align-items-center"><div><h6 className="mb-2">Role-permission matrix</h6><p className="text-sm text-secondary-light mb-0">Changes are saved with one bulk PATCH request.</p></div><button className="btn btn-primary-600" onClick={() => saveMatrix.mutate()} disabled={saveMatrix.isPending}>{saveMatrix.isPending ? "Saving..." : "Save matrix"}</button></div><div className="card-body p-0"><div className="table-responsive"><table className="table bordered-table mb-0"><thead><tr><th>Role</th>{permissions.data.data.map((permission: BaseRecord) => <th key={String(permission.id)} className="text-center text-nowrap">{String(permission.name)}</th>)}</tr></thead><tbody>{roles.data.data.map((role: BaseRecord) => <tr key={String(role.id)}><td className="fw-semibold">{String(role.name)}</td>{permissions.data!.data.map((permission: BaseRecord) => { const key = `${role.id}-${permission.id}`; return <td className="text-center" key={key}><input type="checkbox" className="form-check-input" checked={checked.has(key)} onChange={() => setChecked((current) => { const next = new Set(current); next.has(key) ? next.delete(key) : next.add(key); return next; })} /></td>; })}</tr>)}</tbody></table></div></div></div>
    <ThemeModal open={Boolean(editing)} title={editing === "new" ? "Add permission" : "Edit permission"} onClose={() => setEditing(null)} footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary-600" disabled={!form.name || savePermission.isPending} onClick={() => savePermission.mutate()}>{savePermission.isPending ? "Saving..." : "Save permission"}</button></>}><label className="form-label">Permission key</label><input className="form-control mb-16" placeholder="e.g. manage_reports" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><label className="form-label">Description</label><textarea className="form-control" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></ThemeModal>
    <ActionModal open={Boolean(deleting)} title="Delete permission" description={deleting ? `Delete ${deleting.name}? Role assignments will be removed by the API.` : ""} confirmLabel="Delete permission" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => removePermission.mutate()} loading={removePermission.isPending} />
  </>;
};
export default PermissionsPage;
