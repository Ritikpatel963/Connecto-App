import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { packagesApi } from "../api/packages";
import { CallRatePackage } from "../types";

const EditPackagePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    coins: 0,
    price: 0,
    currency: "USD",
    status: "active" as "active" | "inactive",
    billing_unit: "minute" as "second" | "minute" | "hour",
  });

  const { data: packageData, isLoading } = useQuery({
    queryKey: ["package", id],
    queryFn: () => packagesApi.get(id as string),
    enabled: !!id,
  });

  useEffect(() => {
    if (packageData) {
      setFormData({
        name: packageData.name || "",
        coins: packageData.coins || 0,
        price: packageData.price || 0,
        currency: packageData.currency || "USD",
        status: packageData.status || "active",
        billing_unit: packageData.billing_unit || "minute",
      });
    }
  }, [packageData]);

  const mutation = useMutation({
    mutationFn: (data: Partial<CallRatePackage>) => packagesApi.update(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      queryClient.invalidateQueries({ queryKey: ["package", id] });
      navigate("/subscriptions");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) return <div className="p-4"><Icon icon="eos-icons:loading" /> Loading...</div>;

  return (
    <div className="edit-package-page">
      <PageHeader
        title="Edit Calling Package"
        description="Update calling package details."
        icon="solar:pen-outline"
      />
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="max-w-md">
            <div className="mb-3">
              <label className="form-label fw-semibold">Calling Package Name</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Basic Calling Package"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Coins (Call Minutes Equivalent)</label>
              <input
                type="number"
                className="form-control"
                required
                min="1"
                value={formData.coins || ""}
                onChange={(e) => setFormData({ ...formData, coins: Number(e.target.value) })}
                placeholder="Number of coins"
              />
            </div>

            <div className="row mb-3">
              <div className="col-8">
                <label className="form-label fw-semibold">Price</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  placeholder="Price"
                />
              </div>
              <div className="col-4">
                <label className="form-label fw-semibold">Currency</label>
                <select
                  className="form-select"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Billing Unit</label>
              <select
                className="form-select"
                value={formData.billing_unit}
                onChange={(e) => setFormData({ ...formData, billing_unit: e.target.value as any })}
              >
                <option value="second">Per Second</option>
                <option value="minute">Per Minute</option>
                <option value="hour">Per Hour</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/subscriptions")}
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary-600 d-inline-flex align-items-center gap-2"
                disabled={mutation.isPending}
              >
                {mutation.isPending && <Icon icon="eos-icons:loading" />}
                Save Changes
              </button>
            </div>
            {mutation.isError && (
              <div className="text-danger mt-3">
                Error updating package: {(mutation.error as Error).message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPackagePage;
