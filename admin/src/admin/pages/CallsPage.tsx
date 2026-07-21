import React from "react";
import { callsApi } from "../api/calls";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, MoneyCell, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { CallRecord, SelectFilter } from "../types";

const formatDuration = (seconds: number) => `${String(Math.floor((seconds || 0) / 60)).padStart(2, "0")}:${String((seconds || 0) % 60).padStart(2, "0")}`;

const filters: SelectFilter[] = [{ key: "status", label: "Status", options: ["initiated", "ongoing", "completed", "missed", "rejected", "failed"].map((value) => ({ label: value, value })) }, { key: "created_at", label: "Date", options: ["2026-07-03 11:02", "2026-07-03 10:18", "2026-07-03 09:55", "2026-07-03 09:14"].map((value) => ({ label: value.slice(0, 10) + " \u00B7 " + value.slice(11), value })) }];

const CallsPage = () => {
  const columns = [
    { key: "id", label: "Call ID" },
    { key: "caller", label: "Caller", render: (row: CallRecord) => <PersonCell name={row.caller} userId={row.caller_user_id as number} /> },
    { key: "receiver", label: "Receiver", render: (row: CallRecord) => <PersonCell name={row.receiver} userId={row.receiver_user_id as number} /> },
    { key: "duration_seconds", label: "Duration", render: (row: CallRecord) => <span className="font-monospace">{formatDuration(row.duration_seconds)}</span> },
    { key: "rate_per_min_charged", label: "Rate/min", render: (row: CallRecord) => <MoneyCell value={row.rate_per_min_charged} /> },
    { key: "total_cost", label: "Total cost", render: (row: CallRecord) => <MoneyCell value={row.total_cost} /> },
    { key: "status", label: "Status", render: (row: CallRecord) => <StatusBadge value={row.status} /> },
    { key: "created_at", label: "Created", render: (row: CallRecord) => <DateCell value={row.created_at} /> },
  ];
  return <div className="user-management-page call-log-page"><PageHeader title="Call Log" description="Read-only Agora voice call history with duration and billing." icon="solar:phone-calling-outline" /><AdminDataTable<CallRecord> queryKey={["calls"]} queryFn={callsApi.list} columns={columns} filters={filters} initialSort={{ key: "created_at", direction: "desc" }} /></div>;
};
export default CallsPage;
