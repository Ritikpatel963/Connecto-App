import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { permissionsApi, rolesApi } from "../api/rbac";
import { supabase } from "../../lib/supabase";
import ActionModal from "../components/ActionModal";
import AdminDataTable from "../components/AdminDataTable";
import { IconButton } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ThemeModal from "../components/ThemeModal";
import { BaseRecord } from "../types";

type PermissionAction = "view" | "create" | "edit" | "delete" | "approve";
type PermissionMatrix = Record<string, Record<PermissionAction, boolean>>;

interface RoleForm {
  name: string;
  description: string;
  is_active: boolean;
  permissions: PermissionMatrix;
}

const permissionActions: Array<{ key: PermissionAction; label: string }> = [
  { key: "view", label: "View" },
  { key: "create", label: "Create" },
  { key: "edit", label: "Edit" },
  { key: "delete", label: "Delete" },
  { key: "approve", label: "Approve" },
];

const permissionModules = [
  { key: "dashboard", label: "Dashboard", icon: "solar:widget-5-outline", readOnly: ["view"] },
  { key: "users", label: "Users", icon: "solar:users-group-rounded-outline" },
  { key: "id_verifications", label: "ID Verifications", icon: "solar:shield-user-outline", disabled: ["create", "delete"] },
  { key: "voice_verifications", label: "Voice Verifications", icon: "solar:microphone-3-outline", disabled: ["create", "delete"] },
  { key: "wallet", label: "Wallet", icon: "solar:wallet-money-outline", disabled: ["delete"] },
  { key: "referrals", label: "Referral Program", icon: "solar:gift-outline" },
  { key: "calls", label: "Calls", icon: "solar:phone-calling-outline", disabled: ["create", "approve"] },
  { key: "chat", label: "Chat", icon: "solar:chat-round-dots-outline", disabled: ["create", "approve"] },
  { key: "ratings", label: "Ratings & Reviews", icon: "solar:star-outline", disabled: ["create", "approve"] },
  { key: "admin_roles", label: "Admin & Roles", icon: "solar:user-shield-outline" },
  { key: "packages", label: "Packages", icon: "solar:crown-star-outline" },
  { key: "cms", label: "Content (CMS)", icon: "solar:document-text-outline" },
  { key: "settings", label: "Settings", icon: "solar:settings-outline" },
];

const emptyPermissions = (): PermissionMatrix => Object.fromEntries(
  permissionModules.map((module) => [module.key, Object.fromEntries(permissionActions.map((action) => [action.key, false])) as Record<PermissionAction, boolean>])
);

const presetPermissions = (roleName = "") => {
  const permissions = emptyPermissions();
  const set = (moduleKey: string, actions: PermissionAction[]) => actions.forEach((action) => { permissions[moduleKey][action] = true; });
  const normalized = roleName.toLowerCase();

  if (normalized.includes("super")) {
    permissionModules.forEach((module) => permissionActions.forEach((action) => {
      if (!module.disabled?.includes(action.key)) permissions[module.key][action.key] = true;
    }));
    return permissions;
  }

  set("dashboard", ["view"]);
  if (normalized.includes("finance")) {
    set("wallet", ["view", "edit", "approve"]);
    set("referrals", ["view", "edit", "approve"]);
    set("users", ["view"]);
    return permissions;
  }

  set("users", ["view", "edit"]);
  set("id_verifications", ["view", "edit", "approve"]);
  set("voice_verifications", ["view", "edit", "approve"]);
  set("calls", ["view"]);
  set("chat", ["view", "edit"]);
  set("ratings", ["view", "edit", "delete"]);
  return permissions;
};

const permissionCount = (permissions: PermissionMatrix) => Object.values(permissions).reduce(
  (total, modulePermissions) => total + Object.values(modulePermissions).filter(Boolean).length,
  0
);

const numberValue = (value: unknown) => Number(value || 0);

const RoleSummaryCard = ({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: "primary" | "success" | "info" | "warning" }) => (
  <div className="col-xxl-3 col-md-6">
    <div className="card h-100 role-summary-card">
      <div className="card-body p-24">
        <span className={`role-summary-icon bg-${tone}-focus text-${tone}-main`}><Icon icon={icon} /></span>
        <p className="role-summary-label mb-6 mt-16">{label}</p>       <div className="role-summary-value">{value.toLocaleString("en-IN")}</div>
      </div>
    </div>
  </div>
);

const RolesPage = () => {
  const client = useQueryClient();
  const rolesSummary = useQuery({ queryKey: ["roles-summary"], queryFn: () => rolesApi.list({ page: 1, pageSize: 100 }) });
  const [editing, setEditing] = useState<BaseRecord | null | "new">(null);
  const [deleting, setDeleting] = useState<BaseRecord | null>(null);
  const [form, setForm] = useState<RoleForm>({ name: "", description: "", is_active: true, permissions: emptyPermissions() });

  const open = async (row?: BaseRecord) => {
    const name = row ? String(row.name) : "";
    setEditing(row || "new");
    const basePermissions = presetPermissions(name);

    if (row?.id) {
      // Load actual saved permissions from DB
      try {
        const { data: savedPerms } = await supabase
          .from("permissions")
          .select("name, role_permissions!inner(role_id)")
          .eq("role_permissions.role_id", row.id);
        if (savedPerms && savedPerms.length > 0) {
          // Reset to empty then mark saved ones
          const matrix = emptyPermissions();
          savedPerms.forEach((p: any) => {
            const [mod, action] = String(p.name).split(".");
            if (matrix[mod] && action in matrix[mod]) matrix[mod][action as PermissionAction] = true;
          });
          setForm({ name, description: row ? String(row.description || "") : "", is_active: row?.is_active === undefined ? true : Boolean(row.is_active), permissions: matrix });
          return;
        }
      } catch (_) { /* fallback to preset */ }
    }
    setForm({ name, description: row ? String(row.description || "") : "", is_active: row?.is_active === undefined ? true : Boolean(row.is_active), permissions: basePermissions });
  };

  const togglePermission = (moduleKey: string, action: PermissionAction) => {
    setForm((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [moduleKey]: {
          ...current.permissions[moduleKey],
          [action]: !current.permissions[moduleKey][action],
        },
      },
    }));
  };

  const savePayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
  });

  const savePermissionMatrix = async (roleId: string | number) => {
    // Fetch all permission rows to get their IDs
    const allPerms = await permissionsApi.list({ page: 1, pageSize: 500 });
    const permMap = new Map(allPerms.data.map((p: any) => [String(p.name), Number(p.id)]));

    // Build list of permission names that are checked
    const checked: string[] = [];
    permissionModules.forEach((mod) => {
      permissionActions.forEach((action) => {
        const disabled = mod.disabled?.includes(action.key) || (mod.readOnly && !mod.readOnly.includes(action.key));
        if (!disabled && form.permissions[mod.key]?.[action.key]) checked.push(`${mod.key}.${action.key}`);
      });
    });

    // Delete old, insert new
    const { error: delError } = await supabase.from("role_permissions").delete().eq("role_id", roleId);
    if (delError) throw new Error("Failed to clear old permissions: " + delError.message);

    const inserts = checked.filter((name) => permMap.has(name)).map((name) => ({ role_id: roleId, permission_id: permMap.get(name) }));
    if (inserts.length) {
      const { error: insError } = await supabase.from("role_permissions").insert(inserts);
      if (insError) throw new Error("Failed to save new permissions: " + insError.message);
    }
  };

  const refreshRoles = () => {
    client.invalidateQueries({ queryKey: ["roles"] });
    client.invalidateQueries({ queryKey: ["roles-summary"] });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload = savePayload();
      const result = editing === "new" ? await rolesApi.create(payload) : await rolesApi.update(editing!.id, payload);
      const roleId = result.id ?? (editing !== "new" ? editing!.id : undefined);
      if (roleId) await savePermissionMatrix(roleId);
      return result;
    },
    onSuccess: () => { toast.success("Role saved"); setEditing(null); refreshRoles(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({ mutationFn: () => rolesApi.remove(deleting!.id), onSuccess: () => { toast.success("Role deleted"); setDeleting(null); refreshRoles(); } });
  const columns = [
    { key: "name", label: "Role" },
    { key: "description", label: "Description", className: "min-w-240-px" },
    { key: "permissions", label: "Permissions" },
    { key: "admins", label: "Admins" },
  ];
  const roleRows = rolesSummary.data?.data || [];
  const totalRoles = rolesSummary.isLoading ? 0 : roleRows.length;
  const activeRoles = rolesSummary.isLoading ? 0 : roleRows.filter((role: BaseRecord) => role.is_active === undefined || role.is_active === true || role.status === "active").length;
  const assignedUsers = roleRows.reduce((total: number, role: BaseRecord) => total + numberValue(role.admins), 0);
  const pendingApproval = roleRows.filter((role: BaseRecord) => String(role.status || "").toLowerCase() === "pending").length;

  return <div className="user-management-page admin-access-page roles-page">
    <PageHeader title="Roles" description="Create role bundles for admin permissions." icon="solar:users-group-two-rounded-outline" actions={<button className="btn btn-primary-600" onClick={() => open()}>Create role</button>} />
    <div className="row gy-4 mb-24">
      <RoleSummaryCard label="Total Roles" value={totalRoles} icon="solar:shield-keyhole-outline" tone="primary" />
      <RoleSummaryCard label="Active Roles" value={activeRoles} icon="solar:check-circle-outline" tone="success" />
      <RoleSummaryCard label="Users Assigned" value={assignedUsers} icon="solar:users-group-rounded-outline" tone="info" />
      <RoleSummaryCard label="Pending Approval" value={pendingApproval} icon="solar:hourglass-line-outline" tone="warning" />
    </div>
    <AdminDataTable<BaseRecord> queryKey={["roles"]} queryFn={rolesApi.list} columns={columns} renderActions={(row) => <><IconButton icon="solar:pen-outline" title="Edit role" onClick={() => open(row)} /><IconButton icon="solar:trash-bin-trash-outline" title="Delete role" tone="danger" onClick={() => setDeleting(row)} /></>} />

    <ThemeModal
      open={Boolean(editing)}
      title={editing === "new" ? "Create Role" : "Edit Role"}
      size="xl"
      onClose={() => setEditing(null)}
      footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary-600" disabled={!form.name.trim() || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving..." : "Save role"}</button></>}
    >
      <div className="row gy-3">
        <div className="col-md-6"><label className="form-label fw-semibold">Role Name</label><input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter role name" /></div>
        <div className="col-md-6"><label className="form-label fw-semibold">Status</label><select className="form-select" value={form.is_active ? "active" : "inactive"} onChange={(event) => setForm({ ...form, is_active: event.target.value === "active" })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
        <div className="col-12"><label className="form-label fw-semibold">Description</label><textarea className="form-control" rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe what this role can manage" /></div>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-24 mb-12">
        <div><h6 className="mb-2">Permission Matrix</h6><p className="text-sm text-secondary-light mb-0">Choose what this role can access inside the admin panel.</p></div>
        <StatusBadge value={`${permissionCount(form.permissions)} selected`} />
      </div>

      <div className="table-responsive scroll-sm border rounded-3">
        <table className="table bordered-table mb-0 role-permission-table">
          <thead>
            <tr>
              <th className="min-w-240-px">Module</th>
              {permissionActions.map((action) => <th key={action.key} className="text-center text-nowrap">{action.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {permissionModules.map((module) => <tr key={module.key}>
              <td><span className="d-inline-flex align-items-center gap-10 fw-medium text-primary-light"><Icon icon={module.icon} className="text-lg text-secondary-light" />{module.label}</span></td>
              {permissionActions.map((action) => {
                const disabled = module.disabled?.includes(action.key) || (module.readOnly && !module.readOnly.includes(action.key));
                return <td className="text-center" key={action.key}>{disabled ? <span className="text-secondary-light">-</span> : <input type="checkbox" className="form-check-input" checked={form.permissions[module.key][action.key]} onChange={() => togglePermission(module.key, action.key)} aria-label={`${module.label} ${action.label}`} />}</td>;
              })}
            </tr>)}
          </tbody>
        </table>
      </div>
    </ThemeModal>

    <ActionModal open={Boolean(deleting)} title="Delete role" description={deleting ? `Delete ${deleting.name}? Existing admins must be reassigned by the API.` : ""} confirmLabel="Delete role" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => remove.mutate()} loading={remove.isPending} />
  </div>;
};
export default RolesPage;

