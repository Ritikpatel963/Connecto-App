import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DateCell } from "../components/Cells";
import AdminDataTable from "../components/AdminDataTable";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { coinPackagesApi } from "../api/coinPackages";
import { ColumnDef, SelectFilter, CoinPackage } from "../types";

const filters: SelectFilter[] = [
  { key: "status", label: "Status", options: ["active", "inactive"].map((value) => ({ label: value.replace(/^\w/, c => c.toUpperCase()), value })) },
];

const columns: ColumnDef<CoinPackage>[] = [
  { key: "id", label: "ID" },
  { key: "name", label: "Package Name" },
  { key: "coins", label: "Coins", render: (row) => <strong>{row.coins}</strong> },
  { key: "price", label: "Price", render: (row) => <span>{row.currency || "INR"} {row.price.toFixed(2)}</span> },
  { key: "is_active", label: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
  { key: "created_at", label: "Created", render: (row) => <DateCell value={row.created_at} /> },
];

const RechargePackagesPage = () => {
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => coinPackagesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coin-packages"] });
    },
  });

  const handleDelete = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="recharge-packages-page">
      <PageHeader title="Coin Recharge Packages" description="Manage fiat-to-coin packages for users to purchase." icon="solar:bag-heart-outline" />
      <AdminDataTable<CoinPackage>
        queryKey={["coin-packages"]}
        queryFn={coinPackagesApi.list}
        columns={columns}
        filters={filters}
        initialSort={{ key: "created_at", direction: "desc" }}
        toolbar={
          <Link to="/recharge-packages/create" className="btn btn-primary-600 d-inline-flex align-items-center gap-2">
            <Icon icon="solar:add-circle-outline" /> Create Package
          </Link>
        }
        renderActions={(row) => (
          <>
            <Link to={`/recharge-packages/edit/${row.id}`} className="btn btn-sm btn-outline-primary" title="Edit">
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

export default RechargePackagesPage;
