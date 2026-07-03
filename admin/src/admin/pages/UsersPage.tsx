import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { usersApi } from "../api/users";
import AdminDataTable from "../components/AdminDataTable";
import ActionModal from "../components/ActionModal";
import { DateCell, IconButton, MoneyCell, PersonCell, RatingCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { SelectFilter, User } from "../types";

const filters: SelectFilter[] = [
  { key: "gender", label: "Gender", options: ["male", "female", "other"].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value })) },
  { key: "country", label: "Country", options: [{ label: "India", value: "India" }] },
  { key: "is_online", label: "Online", options: [{ label: "Online", value: "true" }, { label: "Offline", value: "false" }] },
  { key: "is_active", label: "Status", options: [{ label: "Active", value: "true" }, { label: "Inactive", value: "false" }] },
  { key: "is_id_verified", label: "Verified", options: [{ label: "ID verified", value: "true" }, { label: "Not verified", value: "false" }] },
];

const UsersPage = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [action, setAction] = useState<{ type: "suspend" | "activate" | "delete"; user: User } | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!action) return;
      if (action.type === "delete") return usersApi.remove(action.user.id);
      return action.type === "suspend" ? usersApi.suspend(action.user.id) : usersApi.activate(action.user.id);
    },
    onSuccess: () => { toast.success("User updated"); setAction(null); client.invalidateQueries({ queryKey: ["users"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns = [
    { key: "name", label: "User", render: (row: User) => <PersonCell name={row.name} subtitle={row.id} online={row.is_online} /> },
    { key: "age", label: "Age" }, { key: "gender", label: "Gender" },
    { key: "country", label: "Country" }, { key: "state", label: "State" }, { key: "city", label: "City" },
    { key: "is_online", label: "Online", render: (row: User) => <StatusBadge value={row.is_online ? "online" : "offline"} /> },
    { key: "call_rate", label: "Call rate", render: (row: User) => <MoneyCell value={row.call_rate} /> },
    { key: "average_rating", label: "Rating", render: (row: User) => <RatingCell value={row.average_rating} /> },
    { key: "is_id_verified", label: "ID", render: (row: User) => <StatusBadge value={row.is_id_verified ? "verified" : "pending"} /> },
    { key: "is_voice_verified", label: "Voice", render: (row: User) => <StatusBadge value={row.is_voice_verified ? "verified" : "pending"} /> },
    { key: "is_active", label: "Account", render: (row: User) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
    { key: "created_at", label: "Joined", render: (row: User) => <DateCell value={row.created_at} /> },
  ];

  return <>
    <PageHeader title="All Users" description="Search, filter, review and manage member accounts." icon="solar:users-group-rounded-outline" />
    <AdminDataTable<User>
      queryKey={["users"]}
      queryFn={usersApi.list}
      columns={columns}
      filters={filters}
      initialSort={{ key: "created_at", direction: "desc" }}
      searchPlaceholder="Search by name, city or referral code..."
      renderActions={(user) => <>
        <IconButton icon="iconamoon:eye-light" title="View user" onClick={() => navigate(`/users/${user.id}`)} />
        <IconButton icon={user.is_active ? "solar:pause-circle-outline" : "solar:play-circle-outline"} title={user.is_active ? "Suspend user" : "Activate user"} tone={user.is_active ? "warning" : "success"} onClick={() => setAction({ type: user.is_active ? "suspend" : "activate", user })} />
        <IconButton icon="solar:trash-bin-trash-outline" title="Delete user" tone="danger" onClick={() => setAction({ type: "delete", user })} />
      </>}
    />
    <ActionModal open={Boolean(action)} title={action?.type === "delete" ? "Delete user" : action?.type === "suspend" ? "Suspend user" : "Activate user"} description={action ? `${action.type[0].toUpperCase() + action.type.slice(1)} ${action.user.name}?` : ""} confirmLabel="Confirm" tone={action?.type === "activate" ? "success" : "danger"} onClose={() => setAction(null)} onConfirm={() => mutation.mutate()} loading={mutation.isPending} />
  </>;
};
export default UsersPage;
