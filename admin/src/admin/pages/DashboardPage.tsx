import React from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { dashboardApi } from "../api/dashboard";
import PageHeader from "../components/PageHeader";
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
    ["Revenue today", `₹${query.data.revenue_today.toLocaleString("en-IN")}`, "solar:chart-2-bold", "success"],
  ];

  const chartOptions = {
    chart: { toolbar: { show: false } }, colors: ["#487FFF", "#45B369"], dataLabels: { enabled: false },
    stroke: { curve: "smooth" as const, width: 3 }, grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
    xaxis: { categories: ["27 Jun", "28 Jun", "29 Jun", "30 Jun", "1 Jul", "2 Jul", "3 Jul"] },
    legend: { position: "top" as const, horizontalAlign: "right" as const },
  };
  const series = [{ name: "New users", data: [182, 214, 198, 246, 274, 308, 341] }, { name: "Completed calls", data: [1240, 1488, 1392, 1760, 1884, 2010, 2268] }];

  return <>
    <PageHeader title="Dashboard" description="Live operational overview for Connecting People." icon="solar:chart-2-outline" />
    <div className="row gy-4 mb-24">
      {metrics.map(([label, value, icon, tone]) => <div className="col-xxl-2 col-md-4 col-sm-6" key={String(label)}><div className="card h-100"><div className="card-body p-20">
        <span className={`w-44-px h-44-px rounded-circle bg-${tone}-focus text-${tone}-main d-flex align-items-center justify-content-center mb-16`}><Icon icon={String(icon)} className="text-xl" /></span>
        <p className="text-sm text-secondary-light mb-6">{label}</p><h4 className="mb-0">{value}</h4>
      </div></div></div>)}
    </div>
    <div className="row gy-4">
      <div className="col-xl-8"><div className="card h-100"><div className="card-header border-bottom bg-base py-16 px-24"><h6 className="mb-2">Platform growth</h6><p className="text-sm text-secondary-light mb-0">Users and completed calls, last seven days</p></div><div className="card-body p-24"><ReactApexChart options={chartOptions} series={series} type="area" height={315} /></div></div></div>
      <div className="col-xl-4"><div className="card h-100"><div className="card-header border-bottom bg-base py-16 px-24"><h6 className="mb-2">Needs attention</h6><p className="text-sm text-secondary-light mb-0">Pending admin workflows</p></div><div className="card-body p-0">
        {[
          ["ID & voice verification", query.data.pending_verifications, "/verifications/id", "solar:shield-check-outline"],
          ["Manual wallet recharges", query.data.pending_wallet_approvals, "/wallet/manual-approvals", "solar:wallet-2-outline"],
          ["Referral redemptions", query.data.pending_referral_redemptions, "/referrals/redemptions", "solar:gift-outline"],
        ].map(([label, count, to, icon]) => <Link to={String(to)} className="d-flex align-items-center justify-content-between px-24 py-18 border-bottom text-decoration-none hover-bg-neutral-50" key={String(label)}><span className="d-flex align-items-center gap-12"><span className="w-36-px h-36-px rounded-circle bg-warning-focus text-warning-main d-flex align-items-center justify-content-center"><Icon icon={String(icon)} /></span><span className="fw-semibold text-primary-light">{label}</span></span><span className="bg-danger-focus text-danger-main rounded-pill px-10 py-4 text-xs fw-bold">{count}</span></Link>)}
      </div></div></div>
    </div>
  </>;
};
export default DashboardPage;
