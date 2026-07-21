import React from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DateCell } from "../components/Cells";
import AdminDataTable from "../components/AdminDataTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { packagesApi } from "../api/packages";
import { settingsApi } from "../api/settings";
import { ColumnDef, SelectFilter, CallRatePackage } from "../types";

const filters: SelectFilter[] = [
  { key: "status", label: "Status", options: ["active", "inactive"].map((value) => ({ label: value.replace(/^\w/, c => c.toUpperCase()), value })) },
];

const columns: ColumnDef<CallRatePackage>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Package Name" },
  { key: "coins", label: "Coins", render: (row) => <strong>{row.coins}</strong> },
  { key: "price", label: "Price", render: (row) => <span>{row.currency || "USD"} {row.price.toFixed(2)}</span> },
  { key: "billing_unit", label: "Billing Unit", render: (row) => <span className="text-capitalize">{row.billing_unit || "minute"}</span> },
  { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
  { key: "created_at", label: "Created", render: (row) => <DateCell value={row.created_at} /> },
];

const SubscriptionsPage = () => {
  const queryClient = useQueryClient();
  const { data: defaultPackageId } = useQuery({ queryKey: ["default_girl_package_id"], queryFn: () => settingsApi.get("default_girl_package_id") });
  
  const setDefaultMutation = useMutation({
    mutationFn: (id: string | number) => settingsApi.set("default_girl_package_id", String(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["default_girl_package_id"] });
    }
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => packagesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
  });

  const handleDelete = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="packages-page">
      <PageHeader title="Packages" description="Manage call rate packages." icon="solar:crown-star-outline" />
      <AdminDataTable<CallRatePackage>
        queryKey={["packages"]}
        queryFn={packagesApi.list}
        columns={[
          ...columns.filter(c => c.key !== 'name'),
          { 
            key: "name", 
            label: "Package Name", 
            render: (row) => (
              <div className="d-flex align-items-center gap-2">
                <span>{row.name}</span>
                {String(row.id) === String(defaultPackageId) && <span className="badge bg-primary-100 text-primary-600 rounded-pill text-xs">Default</span>}
              </div>
            )
          }
        ]}
        filters={filters}
        initialSort={{ key: "created_at", direction: "desc" }}
        toolbar={
          <Link to="/packages/create" className="btn btn-primary-600 d-inline-flex align-items-center gap-2">
            <Icon icon="solar:add-circle-outline" /> Create Package
          </Link>
        }
        renderActions={(row) => (
          <>
            {String(row.id) !== String(defaultPackageId) && (
              <button className="btn btn-sm btn-outline-success me-2" title="Set as Default for Girls" onClick={() => setDefaultMutation.mutate(row.id)}>
                <Icon icon="solar:star-outline" />
              </button>
            )}
            <Link to={`/packages/edit/${row.id}`} className="btn btn-sm btn-outline-primary" title="Edit">
              <Icon icon="solar:pen-outline" />
            </Link>
            <button 
              className="btn btn-sm btn-outline-danger" 
              onClick={() => handleDelete(row.id)} 
              disabled={deleteMutation.isPending}
              title="Delete"
            >
              <Icon icon="solar:trash-bin-trash-outline" />
            </button>
          </>
        )}
      />
    </div>
  );
};

export default SubscriptionsPage;

