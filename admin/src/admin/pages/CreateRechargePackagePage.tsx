import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { coinPackagesApi } from "../api/coinPackages";
import { CoinPackage } from "../types";

const CreateRechargePackagePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    coins: 0,
    price: 0,
    currency: "INR",
    is_active: true,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<CoinPackage>) => coinPackagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coin-packages"] });
      navigate("/recharge-packages");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      created_at: new Date().toISOString(),
    });
  };

  return (
    <div className="create-package-page">
      <PageHeader
        title="Create Recharge Package"
        description="Add a new fiat-to-coins package for users."
        icon="solar:add-circle-outline"
      />
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="max-w-md">
            <div className="mb-3">
              <label className="form-label fw-semibold">Package Name</label>
              <input
                type="text"
                className="form-control"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Starter Kit"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-semibold">Coins Amount</label>
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
                <label className="form-label fw-semibold">Fiat Price</label>
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
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select"
                value={formData.is_active ? "active" : "inactive"}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "active" })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate("/recharge-packages")}
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
                Create Package
              </button>
            </div>
            {mutation.isError && (
              <div className="text-danger mt-3">
                Error creating package: {(mutation.error as Error).message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRechargePackagePage;
