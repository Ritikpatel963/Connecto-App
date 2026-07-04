import React from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashboardApi } from "../api/dashboard";
import PageHeader from "../components/PageHeader";
import PlatformGrowthCard from "../components/PlatformGrowthCard";
import { ErrorState, LoadingState } from "../components/PageStates";

const DashboardPage = () => {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: dashboardApi.metrics });
  if (query.isLoading) return <LoadingState label="Loading platform metrics..." />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => query.refetch()} />;

  const metrics = [
    ["Total users", query.data.total_users.toLocaleString(), "solar:users-group-rounded-bold", "primary"],
    ["Online now", query.data.online_now.toLocaleString(), "solar:wi-fi-router-bold", "success"],
    ["Pending verifications", query.data.pending_verifications, "solar:shield-warning-bold", "warning"],
    ["Wallet approvals", query.data.pending_wallet_approvals, "solar:wallet-money-bold", "info"],
    ["Referral redemptions", query.data.pending_referral_redemptions, "solar:gift-bold", "danger"],
    ["Revenue today", `\u20B9${query.data.revenue_today.toLocaleString("en-IN")}`, "solar:chart-2-bold", "success"],
  ];

  return <div className="dashboard-page">
    <PageHeader title="Dashboard" description="Live operational overview for Connecting People." icon="solar:chart-2-outline" />
    <div className="row gy-4 mb-24">
      {metrics.map(([label, value, icon, tone]) => <div className="col-xxl-2 col-md-4 col-sm-6" key={String(label)}><div className="card h-100"><div className="card-body p-20 dashboard-metric-card-body">
        <span className={`w-44-px h-44-px rounded-circle bg-${tone}-focus text-${tone}-main d-flex align-items-center justify-content-center mb-16`}><Icon icon={String(icon)} className="text-xl" /></span>
        <p className="text-sm text-secondary-light mb-6">{label}</p><h4 className="dashboard-metric-value mb-0">{value}</h4>
      </div></div></div>)}
    </div>
    <div className="row gy-4">
      <div className="col-xl-8"><PlatformGrowthCard /></div>
      <div className="col-xl-4"><div className="card h-100 dashboard-attention-card"><div className="card-header border-bottom bg-base py-16 px-24"><h6 className="mb-2">Needs attention</h6><p className="text-sm text-secondary-light mb-0">Pending admin workflows</p></div><div className="card-body p-0 dashboard-attention-list">
        {[
          ["ID & voice verification", query.data.pending_verifications, "/verifications/id", "solar:shield-check-outline"],
          ["Manual wallet recharges", query.data.pending_wallet_approvals, "/wallet/manual-approvals", "solar:wallet-2-outline"],
          ["Referral redemptions", query.data.pending_referral_redemptions, "/referrals/redemptions", "solar:gift-outline"],
        ].map(([label, count, to, icon]) => <Link to={String(to)} className="dashboard-attention-link d-flex align-items-center justify-content-between px-24 py-18 border-bottom text-decoration-none hover-bg-neutral-50" key={String(label)}><span className="d-flex align-items-center gap-12"><span className="w-36-px h-36-px rounded-circle bg-warning-focus text-warning-main d-flex align-items-center justify-content-center"><Icon icon={String(icon)} /></span><span className="fw-semibold text-primary-light">{label}</span></span><span className="bg-danger-focus text-danger-main rounded-pill px-10 py-4 text-xs fw-bold">{count}</span></Link>)}
      </div></div></div>
    </div>
  </div>;
};
export default DashboardPage;
