import React from "react";
import { DateCell, PersonCell } from "../components/Cells";
import AdminDataTable from "../components/AdminDataTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { subscriptionsApi } from "../api/subscriptions";
import { ColumnDef, SelectFilter, Subscription } from "../types";

const filters: SelectFilter[] = [
  { key: "status", label: "Status", options: ["trialing", "active", "past_due", "canceled", "expired", "refunded"].map((value) => ({ label: value.replaceAll("_", " "), value })) },
];

const columns: ColumnDef<Subscription>[] = [
  { key: "id", label: "Subscription" },
  { key: "user", label: "User", render: (row) => <PersonCell name={row.user?.name || `User #${row.user_id}`} subtitle={row.user?.phone_number} /> },
  { key: "plan_id", label: "Plan" },
  { key: "provider", label: "Provider" },
  { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
  { key: "current_period_end", label: "Renews/Expires", render: (row) => <DateCell value={row.current_period_end} /> },
  { key: "created_at", label: "Created", render: (row) => <DateCell value={row.created_at} /> },
];

const SubscriptionsPage = () => (
  <div className="subscriptions-page">
    <PageHeader title="Subscriptions" description="Review plans, statuses and manual subscription overrides." icon="solar:crown-star-outline" />
    <AdminDataTable<Subscription>
      queryKey={["subscriptions"]}
      queryFn={subscriptionsApi.list}
      columns={columns}
      filters={filters}
      initialSort={{ key: "created_at", direction: "desc" }}
    />
  </div>
);

export default SubscriptionsPage;
