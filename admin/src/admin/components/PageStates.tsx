import React from "react";
import { Icon } from "@iconify/react";

export const LoadingState = ({ label = "Loading data..." }: { label?: string }) => (
  <div className="card"><div className="card-body py-64 text-center">
    <div className="spinner-border text-primary-600 mb-16" role="status" />
    <p className="text-secondary-light mb-0">{label}</p>
  </div></div>
);

export const EmptyState = ({ title = "No records found", message = "Try changing your search or filters." }: { title?: string; message?: string }) => (
  <div className="py-56 text-center">
    <Icon icon="solar:inbox-line-outline" className="text-5xl text-secondary-light mb-12" />
    <h6 className="mb-6">{title}</h6>
    <p className="text-secondary-light text-sm mb-0">{message}</p>
  </div>
);

export const ErrorState = ({ message = "We couldn't load this data.", onRetry }: { message?: string; onRetry?: () => void }) => (
  <div className="card border border-danger-200"><div className="card-body py-48 text-center">
    <Icon icon="solar:danger-triangle-outline" className="text-5xl text-danger-main mb-12" />
    <h6 className="mb-6">Something went wrong</h6>
    <p className="text-secondary-light mb-16">{message}</p>
    {onRetry && <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>Try again</button>}
  </div></div>
);
