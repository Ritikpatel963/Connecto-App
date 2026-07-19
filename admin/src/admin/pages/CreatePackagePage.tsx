import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { packagesApi } from "../api/packages";
import { CallRatePackage } from "../types";

const CreatePackagePage = () => {
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

  const mutation = useMutation({
    mutationFn: (data: Partial<CallRatePackage>) => packagesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      navigate("/subscriptions"); // The URL is still /subscriptions
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
        title="Create Calling Package"
        description="Add a new calling package with coins for users."
        icon="solar:add-circle-outline"
      />
      <div className="card">
        <div className="card-body">
          <div className="alert alert-info d-flex align-items-start gap-2 mb-4">
            <Icon icon="solar:info-circle-outline" className="text-xl flex-shrink-0 mt-1" />
            <p className="mb-0 text-sm">
              <strong>Note:</strong> Coins are deducted based on the receiver's call rate and the billing unit set here. 
              For example, if you set the billing unit to "Minute", coins are cut per minute during the call.
            </p>
          </div>
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
                Create Calling Package
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

export default CreatePackagePage;
