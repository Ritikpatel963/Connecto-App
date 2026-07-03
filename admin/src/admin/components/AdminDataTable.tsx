import React, { useDeferredValue, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { keepPreviousData, QueryKey, useQuery } from "@tanstack/react-query";
import { BaseRecord, ColumnDef, ListParams, ListResponse, SelectFilter, SortDirection } from "../types";
import { EmptyState, ErrorState } from "./PageStates";

interface Props<T extends BaseRecord> {
  queryKey: QueryKey;
  queryFn: (params: ListParams) => Promise<ListResponse<T>>;
  columns: ColumnDef<T>[];
  filters?: SelectFilter[];
  initialSort?: { key: string; direction: SortDirection };
  renderActions?: (row: T) => React.ReactNode;
  toolbar?: React.ReactNode;
  searchPlaceholder?: string;
}

const defaultCell = (value: unknown) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === null || value === undefined || value === "") return "";
  return String(value);
};

const AdminDataTable = <T extends BaseRecord>({
  queryKey,
  queryFn,
  columns,
  filters = [],
  initialSort,
  renderActions,
  toolbar,
  searchPlaceholder = "Search records...",
}: Props<T>) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sortBy, setSortBy] = useState(initialSort?.key);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSort?.direction || "asc");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>(
    () => Object.fromEntries(columns.map((column) => [String(column.key), true]))
  );

  const params = useMemo<ListParams>(() => ({
    page,
    pageSize,
    search: deferredSearch,
    sortBy,
    sortDirection,
    filters: filterValues,
  }), [page, pageSize, deferredSearch, sortBy, sortDirection, filterValues]);

  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => queryFn(params),
    placeholderData: keepPreviousData,
  });

  const visibleColumns = columns.filter((column) => visible[String(column.key)] !== false);
  const total = query.data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const updateFilter = (key: string, value: string) => {
    setPage(1);
    setFilterValues((current) => ({ ...current, [key]: value }));
  };

  const toggleSort = (key: string) => {
    setPage(1);
    if (sortBy === key) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  return (
    <div className="card">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <div className="position-relative" style={{ minWidth: 260 }}>
              <Icon icon="solar:magnifer-linear" className="position-absolute top-50 start-0 translate-middle-y ms-14 text-secondary-light" />
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                className="form-control ps-40"
                placeholder={searchPlaceholder}
              />
            </div>
            {filters.map((filter) => (
              <select key={filter.key} className="form-select w-auto" value={filterValues[filter.key] || ""} onChange={(event) => updateFilter(filter.key, event.target.value)}>
                <option value="">{filter.label}: All</option>
                {filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            ))}
          </div>

          <div className="d-flex align-items-center gap-2">
            {toolbar}
            <div className="dropdown">
              <button className="btn btn-outline-primary-600 d-inline-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                <Icon icon="solar:eye-outline" /> Columns
              </button>
              <div className="dropdown-menu dropdown-menu-end p-16" style={{ minWidth: 220 }}>
                <p className="text-xs text-secondary-light mb-10">Show or hide columns</p>
                {columns.filter((column) => column.hideable !== false).map((column) => (
                  <label className="d-flex align-items-center gap-2 py-6 cursor-pointer" key={String(column.key)}>
                    <input type="checkbox" className="form-check-input mt-0" checked={visible[String(column.key)] !== false} onChange={() => setVisible((current) => ({ ...current, [String(column.key)]: current[String(column.key)] === false }))} />
                    <span className="text-sm">{column.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        {query.isError ? (
          <div className="p-24"><ErrorState message={(query.error as Error).message} onRetry={() => query.refetch()} /></div>
        ) : (
          <div className="table-responsive scroll-sm">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  {visibleColumns.map((column) => (
                    <th key={String(column.key)} className={column.className}>
                      {column.sortable === false ? column.label : (
                        <button className="btn p-0 border-0 bg-transparent fw-semibold text-primary-light d-inline-flex align-items-center gap-1" onClick={() => toggleSort(String(column.key))}>
                          {column.label}
                          <Icon icon={sortBy === column.key ? (sortDirection === "asc" ? "solar:sort-from-top-to-bottom-bold" : "solar:sort-from-bottom-to-top-bold") : "solar:sort-outline"} className="text-secondary-light" />
                        </button>
                      )}
                    </th>
                  ))}
                  {renderActions && <th className="text-end">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {query.isLoading && Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>{visibleColumns.map((column) => <td key={String(column.key)}><span className="placeholder col-8 rounded" /></td>)}{renderActions && <td><span className="placeholder col-6 rounded" /></td>}</tr>
                ))}
                {!query.isLoading && query.data?.data.map((row: T) => (
                  <tr key={String(row.id)}>
                    {visibleColumns.map((column) => (
                      <td key={String(column.key)} className={column.className}>
                        {column.render ? column.render(row) : defaultCell(row[column.key as keyof T])}
                      </td>
                    ))}
                    {renderActions && <td><div className="d-flex justify-content-end gap-2">{renderActions(row)}</div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
            {!query.isLoading && query.data?.data.length === 0 && <EmptyState />}
          </div>
        )}
      </div>

      <div className="card-footer bg-base border-top px-24 py-16">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2 text-sm text-secondary-light">
            <span>Rows per page</span>
            <select className="form-select form-select-sm w-auto" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}>
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <span>{total ? `${(page - 1) * pageSize + 1}${Math.min(page * pageSize, total)} of ${total}` : "0 records"}</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><Icon icon="solar:alt-arrow-left-linear" /></button>
            <span className="text-sm fw-medium px-8">Page {page} of {totalPages}</span>
            <button className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}><Icon icon="solar:alt-arrow-right-linear" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDataTable;
