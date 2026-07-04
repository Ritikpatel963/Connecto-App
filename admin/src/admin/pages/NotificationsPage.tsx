import React from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AdminNotification, notificationsApi } from "../api/notifications";
import AdminDataTable from "../components/AdminDataTable";
import { IconButton } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { ColumnDef, ListParams, ListResponse, SelectFilter } from "../types";

const filters: SelectFilter[] = [
  { key: "is_read", label: "Status", options: [{ label: "Unread", value: "false" }, { label: "Read", value: "true" }] },
  { key: "tone", label: "Type", options: ["primary", "warning", "success", "danger", "info"].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value })) },
];

const searchableText = (item: AdminNotification) => [
  item.title,
  item.message,
  item.time,
  item.tone,
  item.to,
  item.is_read ? "read" : "unread",
].join(" ").toLowerCase();

const compareValues = (a: unknown, b: unknown) => {
  if (typeof a === "boolean" || typeof b === "boolean") return Number(a) - Number(b);
  return String(a ?? "").localeCompare(String(b ?? ""), undefined, { numeric: true, sensitivity: "base" });
};

const buildNotificationTable = (items: AdminNotification[], params: ListParams): ListResponse<AdminNotification> => {
  const search = params.search?.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesSearch = !search || searchableText(item).includes(search);
    const matchesFilters = Object.entries(params.filters || {}).every(([key, value]) => {
      if (value === "" || value === undefined || value === null) return true;
      return String(item[key as keyof AdminNotification]) === String(value);
    });
    return matchesSearch && matchesFilters;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!params.sortBy) return 0;
    const direction = params.sortDirection === "desc" ? -1 : 1;
    return compareValues(a[params.sortBy as keyof AdminNotification], b[params.sortBy as keyof AdminNotification]) * direction;
  });

  const start = (params.page - 1) * params.pageSize;
  return {
    data: sorted.slice(start, start + params.pageSize),
    total: sorted.length,
    page: params.page,
    pageSize: params.pageSize,
  };
};

const notificationTableQuery = async (params: ListParams) => buildNotificationTable(await notificationsApi.list(), params);

const NotificationsPage = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const countQuery = useQuery<AdminNotification[]>({ queryKey: ["admin-notifications"], queryFn: notificationsApi.list });
  const unreadCount = countQuery.data?.filter((item: AdminNotification) => !item.is_read).length || 0;

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });
  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-notifications"] }),
  });

  const openNotification = (item: AdminNotification) => {
    if (!item.is_read) markRead.mutate(item.id as number);
    navigate(item.to);
  };

  const columns: ColumnDef<AdminNotification>[] = [
    {
      key: "title",
      label: "Notification",
      hideable: false,
      render: (row) => <div className="d-flex align-items-center gap-10 min-w-240-px">
        <span className={`w-36-px h-36-px rounded-circle bg-${row.tone}-focus text-${row.tone}-main d-flex align-items-center justify-content-center flex-shrink-0`}><Icon icon={row.icon} /></span>
        <div>
          <span className="d-flex align-items-center gap-2 fw-semibold text-primary-light">{row.title}{!row.is_read && <span className="notifications-unread-dot" aria-label="Unread" />}</span>
          <span className="d-block text-xs text-secondary-light">{row.message}</span>
        </div>
      </div>,
    },
    { key: "is_read", label: "Status", render: (row) => <StatusBadge value={row.is_read ? "read" : "unread"} /> },
    { key: "tone", label: "Type", render: (row) => <span className={`badge bg-${row.tone}-focus text-${row.tone}-main text-capitalize`}>{row.tone}</span> },
    { key: "time", label: "Time" },
    { key: "to", label: "Destination" },
  ];

  return <div className="user-management-page notifications-page">
    <PageHeader
      title="Notifications"
      description="Review recent activity and admin events across the platform. Use the table tools to search, filter, sort and open each event."
      icon="solar:bell-bing-outline"
      actions={<button type="button" className="btn btn-outline-primary-600" disabled={unreadCount === 0 || markAllRead.isPending} onClick={() => markAllRead.mutate()}>{markAllRead.isPending ? "Updating..." : `Mark all as read${unreadCount ? ` (${unreadCount})` : ""}`}</button>}
    />

    <AdminDataTable<AdminNotification>
      queryKey={["admin-notifications"]}
      queryFn={notificationTableQuery}
      columns={columns}
      filters={filters}
      initialSort={{ key: "id", direction: "desc" }}
      searchPlaceholder="Search notifications..."
      defaultVisibleColumns={["title", "is_read", "tone", "time", "to"]}
      renderActions={(row) => <>
        {!row.is_read && <IconButton icon="solar:check-circle-outline" title="Mark as read" tone="success" onClick={() => markRead.mutate(row.id as number)} />}
        <IconButton icon="iconamoon:eye-light" title="Open notification" onClick={() => openNotification(row)} />
      </>}
    />
  </div>;
};

export default NotificationsPage;

