import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";

const toneByStatus = {
  active: "success",
  approved: "success",
  verified: "success",
  qualified: "success",
  credited: "success",
  completed: "success",
  online: "success",
  read: "success",
  pending: "warning",
  initiated: "warning",
  ongoing: "info",
  unread: "warning",
  rejected: "danger",
  failed: "danger",
  suspended: "danger",
  missed: "neutral",
};

const labelize = (value) =>
  String(value ?? "—")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const StatusBadge = ({ value }) => {
  const normalized = String(value || "unknown").toLowerCase();
  const tone = toneByStatus[normalized] || "info";
  const classes =
    tone === "neutral"
      ? "bg-neutral-200 text-neutral-700"
      : `bg-${tone}-focus text-${tone}-main`;

  return (
    <span className={`${classes} px-12 py-4 rounded-pill fw-semibold text-xs text-nowrap`}>
      {labelize(value)}
    </span>
  );
};

const PersonCell = ({ value, row }) => {
  const initials = String(value || "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="d-flex align-items-center gap-10 min-w-160-px">
      <span className="w-36-px h-36-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-sm flex-shrink-0">
        {initials}
      </span>
      <div>
        <div className="fw-semibold text-primary-light">{value}</div>
        {row.email && <div className="text-xs text-secondary-light">{row.email}</div>}
      </div>
    </div>
  );
};

const formatCell = (column, value, row) => {
  if (column.type === "user") return <PersonCell value={value} row={row} />;
  if (column.type === "money") {
    const number = Number(value || 0);
    return <span className={number < 0 ? "text-danger-main fw-semibold" : "fw-semibold"}>{number < 0 ? "-" : ""}₹{Math.abs(number).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>;
  }
  if (column.type === "rating") {
    return (
      <span className="d-inline-flex align-items-center gap-4 fw-semibold">
        <Icon icon="solar:star-bold" className="text-warning-main" />
        {value}
      </span>
    );
  }
  if (column.type === "status") return <StatusBadge value={value} />;
  if (column.type === "verification") {
    const tone = value === "ID + Voice" ? "success" : value === "Unverified" ? "danger" : "info";
    return <span className={`bg-${tone}-focus text-${tone}-main px-12 py-4 rounded-pill fw-semibold text-xs text-nowrap`}>{value}</span>;
  }
  if (column.type === "truncate") {
    return <span className="d-inline-block text-truncate max-w-240-px" title={value}>{value}</span>;
  }
  if (column.type === "date") return <span className="text-nowrap">{value || "—"}</span>;
  return value ?? "—";
};

const exportRows = (config, rows) => {
  const columns = config.columns;
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [
    columns.map((column) => escape(column.label)).join(","),
    ...rows.map((row) => columns.map((column) => escape(row[column.key])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${config.tableName}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(`${config.title} exported`);
};

const DetailPanel = ({ config, row, onClose }) => {
  if (!row) return null;

  return (
    <>
      <button className="position-fixed top-0 start-0 w-100 h-100 border-0 bg-dark bg-opacity-25 z-3" onClick={onClose} aria-label="Close details" />
      <aside className="position-fixed top-0 end-0 h-100 bg-base shadow-lg z-3 overflow-auto" style={{ width: "min(480px, 94vw)" }}>
        <div className="p-24 border-bottom d-flex align-items-start justify-content-between gap-3">
          <div>
            <p className="text-sm text-secondary-light mb-4">{config.tableName}</p>
            <h5 className="mb-0">{config.singular} details</h5>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose} aria-label="Close details">
            <Icon icon="radix-icons:cross-2" />
          </button>
        </div>
        <div className="p-24">
          <div className="bg-neutral-50 radius-12 p-16 mb-24">
            <p className="text-xs text-secondary-light mb-6">Record identifier</p>
            <div className="fw-bold text-lg">{row.id}</div>
          </div>
          <div className="d-grid gap-0">
            {Object.entries(row).map(([key, value]) => (
              <div key={key} className="py-12 border-bottom d-flex align-items-start justify-content-between gap-4">
                <span className="text-sm text-secondary-light">{labelize(key)}</span>
                <span className="text-sm fw-medium text-end text-primary-light text-break" style={{ maxWidth: "62%" }}>
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : value ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

const SchemaDataTable = ({ config }) => {
  const [rows, setRows] = useState(config.rows);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState(null);

  const statusKey = config.columns.find((column) => column.type === "status")?.key;
  const statusValues = useMemo(
    () => statusKey ? [...new Set(rows.map((row) => row[statusKey]).filter(Boolean))] : [],
    [rows, statusKey]
  );

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !needle || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(needle));
      const matchesStatus = status === "all" || !statusKey || row[statusKey] === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, rows, status, statusKey]);

  const updateWorkflow = (row, nextStatus) => {
    const key = row.verification_status !== undefined ? "verification_status" : "status";
    setRows((current) => current.map((item) => item.id === row.id ? { ...item, [key]: nextStatus } : item));
    toast.success(`${row.id} marked ${nextStatus}`);
  };

  return (
    <>
      <div className="card">
        <div className="card-header border-bottom bg-base py-16 px-24">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <h6 className="mb-2">{config.title}</h6>
              <p className="text-sm text-secondary-light mb-0">{filteredRows.length} records shown</p>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2">
              <button type="button" className="btn btn-outline-primary-600 btn-sm d-inline-flex align-items-center gap-2" onClick={() => exportRows(config, filteredRows)}>
                <Icon icon="solar:download-minimalistic-outline" />
                Export CSV
              </button>
              {config.primaryAction && (
                <button type="button" className="btn btn-primary-600 btn-sm d-inline-flex align-items-center gap-2" onClick={() => toast.info(`${config.primaryAction} form ready for API integration`)}>
                  <Icon icon="solar:add-circle-outline" />
                  {config.primaryAction}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-body p-24">
          <div className="row gy-3 mb-20">
            <div className="col-lg-5">
              <div className="position-relative">
                <Icon icon="solar:magnifer-linear" className="position-absolute top-50 start-0 translate-middle-y ms-16 text-secondary-light" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-control ps-40" placeholder={`Search ${config.title.toLowerCase()}...`} />
              </div>
            </div>
            {statusValues.length > 0 && (
              <div className="col-lg-3">
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-select">
                  <option value="all">All statuses</option>
                  {statusValues.map((value) => <option key={value} value={value}>{labelize(value)}</option>)}
                </select>
              </div>
            )}
            <div className="col-lg-4 d-flex align-items-center justify-content-lg-end">
              <span className="text-sm text-secondary-light">Schema: {config.schemaFields.length} fields</span>
            </div>
          </div>

          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  {config.columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const workflowStatus = row.verification_status ?? row.status;
                  return (
                    <tr key={row.id}>
                      {config.columns.map((column) => <td key={column.key}>{formatCell(column, row[column.key], row)}</td>)}
                      <td>
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          {config.workflow === "approval" && workflowStatus === "pending" && (
                            <>
                              <button className="w-32-px h-32-px border-0 bg-success-focus text-success-main rounded-circle d-inline-flex align-items-center justify-content-center" title="Approve" onClick={() => updateWorkflow(row, row.verification_status !== undefined ? "verified" : "approved")}>
                                <Icon icon="solar:check-circle-outline" />
                              </button>
                              <button className="w-32-px h-32-px border-0 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center" title="Reject" onClick={() => updateWorkflow(row, "rejected")}>
                                <Icon icon="solar:close-circle-outline" />
                              </button>
                            </>
                          )}
                          <button className="w-32-px h-32-px border-0 bg-primary-50 text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center" title="View details" onClick={() => setSelected(row)}>
                            <Icon icon="iconamoon:eye-light" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredRows.length === 0 && (
                  <tr><td colSpan={config.columns.length + 1} className="text-center py-40 text-secondary-light">No records match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <DetailPanel config={config} row={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default SchemaDataTable;
