import React from "react";
import { Icon } from "@iconify/react";
import StatusBadge from "./StatusBadge";

export const PersonCell = ({ name, subtitle, online }: { name: unknown; subtitle?: unknown; online?: boolean }) => {
  const text = String(name || "Unknown");
  const initials = text.split(" ").map((part) => part[0]).slice(0, 2).join("");
  return <div className="d-flex align-items-center gap-10 min-w-160-px">
    <span className="position-relative w-36-px h-36-px rounded-circle bg-primary-50 text-primary-600 d-flex align-items-center justify-content-center fw-bold text-sm flex-shrink-0">
      {initials}{online !== undefined && <span className={`position-absolute end-0 bottom-0 w-8-px h-8-px rounded-circle border border-white ${online ? "bg-success-main" : "bg-neutral-400"}`} />}
    </span>
    <div><span className="d-block fw-semibold text-primary-light">{text}</span>{subtitle !== undefined && subtitle !== null && <span className="d-block text-xs text-secondary-light">{String(subtitle)}</span>}</div>
  </div>;
};

export const MoneyCell = ({ value }: { value: unknown }) => {
  const amount = Number(value || 0);
  return <span className={amount < 0 ? "fw-semibold text-danger-main text-nowrap" : "fw-semibold text-nowrap"}>{amount < 0 ? "-" : ""}{"\u20B9"}{Math.abs(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>;
};

export const RatingCell = ({ value }: { value: unknown }) => <span className="d-inline-flex align-items-center gap-4 fw-semibold"><Icon icon="solar:star-bold" className="text-warning-main" />{String(value ?? "-")}</span>;

export const BooleanBadge = ({ value, yes = "Yes", no = "No" }: { value: unknown; yes?: string; no?: string }) => <StatusBadge value={value ? yes : no} />;

export const DateCell = ({ value }: { value: unknown }) => {
  if (!value) return <span className="text-nowrap text-sm">-</span>;
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return <span className="text-nowrap text-sm">{String(value)}</span>;
  
  const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  
  return (
    <span className="text-nowrap text-sm">
      <span className="fw-medium text-secondary-light">{dateStr}</span>
      <span className="ms-2 fw-semibold">{timeStr}</span>
    </span>
  );
};

export const IconButton = ({ icon, title, tone = "primary", onClick }: { icon: string; title: string; tone?: "primary" | "success" | "danger" | "warning"; onClick: () => void }) => (
  <button type="button" title={title} aria-label={title} onClick={onClick} className={`w-32-px h-32-px border-0 rounded-circle d-inline-flex align-items-center justify-content-center bg-${tone === "primary" ? "primary-50" : tone + "-focus"} text-${tone === "primary" ? "primary-600" : tone + "-main"}`}><Icon icon={icon} /></button>
);
