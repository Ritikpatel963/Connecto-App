import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usersApi } from "../api/users";
import { packagesApi } from "../api/packages";
import AdminDataTable from "../components/AdminDataTable";
import ActionModal from "../components/ActionModal";
import { DateCell, IconButton, MoneyCell, PersonCell, RatingCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import ThemeModal from "../components/ThemeModal";
import { SelectFilter, User } from "../types";

const filters: SelectFilter[] = [
  { key: "gender", label: "Gender", options: ["male", "female", "other"].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value })) },
  { key: "country", label: "Country", options: [{ label: "India", value: "India" }] },
  { key: "is_online", label: "Online", options: [{ label: "Online", value: "true" }, { label: "Offline", value: "false" }] },
  { key: "is_active", label: "Status", options: [{ label: "Active", value: "true" }, { label: "Inactive", value: "false" }] },
  { key: "is_id_verified", label: "Verified", options: [{ label: "ID verified", value: "true" }, { label: "Not verified", value: "false" }] },
];

interface UserForm {
  name: string;
  phone_number: string;
  age: number;
  gender: User["gender"];
  country: string;
  state: string;
  city: string;
  call_rate: number;
  call_package_id: string | number;
  is_active: boolean;
  is_id_verified: boolean;
  is_voice_verified: boolean;
}

const emptyUser: UserForm = { name: "", phone_number: "", age: 18, gender: "male", country: "India", state: "", city: "", call_rate: 0, call_package_id: "", is_active: true, is_id_verified: false, is_voice_verified: false };

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `+91${digits}` : `+${digits}`;
};

const isValidPhoneNumber = (value: string) => /^\+[1-9]\d{7,14}$/.test(normalizePhoneNumber(value));

const formFromUser = (user: User): UserForm => ({
  name: user.name, phone_number: user.phone_number || "", age: user.age, gender: user.gender,
  country: user.country, state: user.state, city: user.city, call_rate: user.call_rate,
  call_package_id: user.call_package_id || "",
  is_active: user.is_active, is_id_verified: user.is_id_verified, is_voice_verified: user.is_voice_verified,
});

const UsersPage = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [form, setForm] = useState<UserForm>(emptyUser);
  const [action, setAction] = useState<{ type: "suspend" | "activate" | "delete"; user: User } | null>(null);

  const { data: packagesData } = useQuery({
    queryKey: ["packages"],
    queryFn: () => packagesApi.list({ page: 1, pageSize: 100 }),
  });
  const packages = packagesData?.data || [];

  const refreshUsers = () => client.invalidateQueries({ queryKey: ["users"] });
  const openEditor = (user?: User) => {
    setEditing(user || "new");
    setForm(user ? formFromUser(user) : { ...emptyUser });
  };

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, phone_number: normalizePhoneNumber(form.phone_number) };
      return editing === "new"
        ? usersApi.create({ ...payload, is_online: false, average_rating: 0, created_at: new Date().toISOString() })
        : usersApi.update(editing!.id, payload);
    },
    onSuccess: () => {
      toast.success(editing === "new" ? "User created" : "User updated");
      setEditing(null);
      refreshUsers();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const statusMutation = useMutation({
    mutationFn: async () => {
      if (!action) return;
      if (action.type === "delete") return usersApi.remove(action.user.id);
      return action.type === "suspend" ? usersApi.suspend(action.user.id) : usersApi.activate(action.user.id);
    },
    onSuccess: () => { toast.success(action?.type === "delete" ? "User deleted" : "User status updated"); setAction(null); refreshUsers(); },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns = [
    { key: "name", label: "User", hideable: false, render: (row: User) => <PersonCell name={row.name} subtitle={row.phone_number} online={row.is_online} /> },
    { key: "phone_number", label: "Phone number" },
    { key: "age", label: "Age" }, { key: "gender", label: "Gender" },
    { key: "country", label: "Country" }, { key: "state", label: "State" }, { key: "city", label: "City" },
    { key: "location", label: "Location", sortable: false, render: (row: User) => <><span className="d-block fw-medium">{row.city || "-"}</span><span className="text-xs text-secondary-light">{[row.state, row.country].filter(Boolean).join(", ")}</span></> },
    { key: "is_online", label: "Online", render: (row: User) => <StatusBadge value={row.is_online ? "online" : "offline"} /> },
    {
      key: "call_package_id", label: "Call rate", render: (row: User) => {
        if (row.gender === 'male') return <span className="text-muted">-</span>;
        const pkg = packages.find((p: any) => String(p.id) === String(row.call_package_id));
        return pkg ? <span className="fw-medium text-primary">{pkg.currency || 'INR'} {pkg.price}/{pkg.billing_unit || 'minute'}</span> : <span className="text-muted">Not set</span>;
      }
    },
    { key: "average_rating", label: "Rating", render: (row: User) => <RatingCell value={row.average_rating} /> },
    { key: "is_id_verified", label: "ID", render: (row: User) => <StatusBadge value={row.is_id_verified ? "verified" : "pending"} /> },
    { key: "is_voice_verified", label: "Voice", render: (row: User) => <StatusBadge value={row.is_voice_verified ? "verified" : "pending"} /> },
    { key: "is_active", label: "Account", render: (row: User) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
    { key: "created_at", label: "Joined", render: (row: User) => <DateCell value={row.created_at} /> },
  ];

  const canSave = Boolean(form.name.trim() && isValidPhoneNumber(form.phone_number) && form.age >= 18 && form.country.trim() && form.city.trim());

  return <div className="user-management-page">
    <PageHeader title="All Users" description="Create, review and manage member accounts. Choose extra table fields from Columns." icon="solar:users-group-rounded-outline" actions={<button className="btn btn-primary-600 d-inline-flex align-items-center gap-2" onClick={() => openEditor()}><Icon icon="solar:user-plus-outline" /> Add user</button>} />
    <AdminDataTable<User>
      queryKey={["users"]}
      queryFn={usersApi.list}
      columns={columns}
      defaultVisibleColumns={["name", "phone_number", "location", "is_online", "call_package_id", "average_rating", "is_active", "created_at"]}
      filters={filters}
      initialSort={{ key: "created_at", direction: "desc" }}
      searchPlaceholder="Search by name, city or referral code..."
      renderActions={(user) => <>
        <IconButton icon="iconamoon:eye-light" title="View user" onClick={() => navigate(`/users/${user.id}`)} />
        <IconButton icon="solar:pen-outline" title="Edit user" onClick={() => openEditor(user)} />
        <IconButton icon={user.is_active ? "solar:pause-circle-outline" : "solar:play-circle-outline"} title={user.is_active ? "Suspend user" : "Activate user"} tone={user.is_active ? "warning" : "success"} onClick={() => setAction({ type: user.is_active ? "suspend" : "activate", user })} />
        <IconButton icon="solar:trash-bin-trash-outline" title="Delete user" tone="danger" onClick={() => setAction({ type: "delete", user })} />
      </>}
    />

    <ThemeModal open={Boolean(editing)} title={editing === "new" ? "Add user" : "Edit user"} onClose={() => setEditing(null)} size="xl" footer={<><button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn btn-primary-600" disabled={!canSave || save.isPending} onClick={() => save.mutate()}>{save.isPending ? "Saving..." : editing === "new" ? "Create user" : "Save changes"}</button></>}>
      <div className="row gy-3">
        <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Enter full name" /></div>
        <div className="col-md-6"><label className="form-label">Phone number <span className="text-danger">*</span></label><input type="tel" className="form-control" value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value.replace(/[^\d+]/g, "") })} placeholder="+919876543210" maxLength={16} required /></div>
        <div className="col-md-3"><label className="form-label">Age</label><input type="number" min={18} className="form-control" value={form.age} onChange={(event) => setForm({ ...form, age: Number(event.target.value) })} /></div>
        <div className="col-md-3"><label className="form-label">Gender</label><select className="form-select" value={form.gender} onChange={(event) => setForm({ ...form, gender: event.target.value as User["gender"] })}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
        {form.gender !== 'male' && (
          <div className="col-md-6">
            <label className="form-label">Call Package</label>
            <select className="form-select" value={form.call_package_id} onChange={(event) => setForm({ ...form, call_package_id: event.target.value })}>
              <option value="">No Package (Free)</option>
              {packages.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.coins} coins/{p.billing_unit || 'min'})</option>)}
            </select>
          </div>
        )}
        <div className="col-md-6"><label className="form-label">Country</label><input className="form-control" value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></div>
        <div className="col-md-6"><label className="form-label">State</label><input className="form-control" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} /></div>
        <div className="col-md-6"><label className="form-label">City</label><input className="form-control" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div>
        <div className="col-12"><div className="bg-neutral-50 radius-12 p-16"><p className="fw-semibold mb-12">Account controls</p><div className="d-flex flex-wrap gap-4">
          <label className="d-flex gap-2 align-items-center"><input type="checkbox" className="form-check-input mt-0" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active account</label>
          <label className="d-flex gap-2 align-items-center"><input type="checkbox" className="form-check-input mt-0" checked={form.is_id_verified} onChange={(event) => setForm({ ...form, is_id_verified: event.target.checked })} /> ID verified</label>
          <label className="d-flex gap-2 align-items-center"><input type="checkbox" className="form-check-input mt-0" checked={form.is_voice_verified} onChange={(event) => setForm({ ...form, is_voice_verified: event.target.checked })} /> Voice verified</label>
        </div></div></div>
      </div>
    </ThemeModal>

    <ActionModal open={Boolean(action)} title={action?.type === "delete" ? "Delete user" : action?.type === "suspend" ? "Suspend user" : "Activate user"} description={action ? `${action.type[0].toUpperCase() + action.type.slice(1)} ${action.user.name}?` : ""} confirmLabel={action?.type === "delete" ? "Delete user" : "Confirm"} tone={action?.type === "activate" ? "success" : "danger"} onClose={() => setAction(null)} onConfirm={() => statusMutation.mutate()} loading={statusMutation.isPending} />
  </div>;
};
export default UsersPage;
