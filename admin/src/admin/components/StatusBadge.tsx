import React from "react";

const tones: Record<string, string> = {
  active: "bg-success-focus text-success-main",
  online: "bg-success-focus text-success-main",
  approved: "bg-success-focus text-success-main",
  verified: "bg-success-focus text-success-main",
  qualified: "bg-success-focus text-success-main",
  credited: "bg-success-focus text-success-main",
  completed: "bg-success-focus text-success-main",
  pending: "bg-warning-focus text-warning-main",
  initiated: "bg-warning-focus text-warning-main",
  ongoing: "bg-info-focus text-info-main",
  unread: "bg-warning-focus text-warning-main",
  rejected: "bg-danger-focus text-danger-main",
  failed: "bg-danger-focus text-danger-main",
  inactive: "bg-neutral-200 text-neutral-700",
  suspended: "bg-danger-focus text-danger-main",
  missed: "bg-neutral-200 text-neutral-700",
  recharge: "bg-primary-50 text-primary-600",
  call_deduction: "bg-warning-focus text-warning-main",
  refund: "bg-info-focus text-info-main",
  referral_reward: "bg-success-focus text-success-main",
};

export const humanize = (value: unknown) =>
  String(value ?? "-").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const StatusBadge = ({ value }: { value: unknown }) => {
  const key = String(value ?? "").toLowerCase();
  return (
    <span className={`${tones[key] || "bg-info-focus text-info-main"} px-12 py-4 rounded-pill fw-semibold text-xs text-nowrap`}>
      {humanize(value)}
    </span>
  );
};

export default StatusBadge;
