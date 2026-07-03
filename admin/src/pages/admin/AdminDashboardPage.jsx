import React from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import MasterLayout from "../../masterLayout/MasterLayout";
import Breadcrumb from "../../components/Breadcrumb";
import { approvalQueue, overviewStats } from "../../data/adminSchema";

const activityOptions = {
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  colors: ["#487FFF", "#45B369"],
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
  xaxis: { categories: ["27 Jun", "28 Jun", "29 Jun", "30 Jun", "1 Jul", "2 Jul", "3 Jul"] },
  legend: { position: "top", horizontalAlign: "right" },
  tooltip: { theme: "light" },
};

const activitySeries = [
  { name: "New users", data: [182, 214, 198, 246, 274, 308, 341] },
  { name: "Completed calls", data: [1240, 1488, 1392, 1760, 1884, 2010, 2268] },
];

const revenueOptions = {
  chart: { toolbar: { show: false } },
  labels: ["Call revenue", "Wallet recharge", "Referral rewards", "Refunds"],
  colors: ["#487FFF", "#45B369", "#FF9F29", "#EF4A62"],
  legend: { position: "bottom" },
  dataLabels: { enabled: false },
  plotOptions: { pie: { donut: { size: "68%" } } },
};

const toneClasses = {
  primary: "bg-primary-50 text-primary-600",
  success: "bg-success-focus text-success-main",
  info: "bg-info-focus text-info-main",
  warning: "bg-warning-focus text-warning-main",
};

const AdminDashboardPage = () => (
  <MasterLayout>
    <Breadcrumb title="Platform Overview" />

    <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-24">
      <div>
        <p className="text-sm text-primary-600 fw-semibold mb-6">Friday, 3 July 2026</p>
        <h3 className="mb-6">Good afternoon, Neha</h3>
        <p className="text-secondary-light mb-0">Here is what needs attention across Connecting People today.</p>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className="w-10-px h-10-px rounded-circle bg-success-main" />
        <span className="text-sm fw-medium">All systems operational</span>
      </div>
    </div>

    <div className="row gy-4 mb-24">
      {overviewStats.map((stat) => (
        <div className="col-xxl-3 col-sm-6" key={stat.label}>
          <div className="card h-100">
            <div className="card-body p-24">
              <div className="d-flex align-items-center justify-content-between gap-3 mb-18">
                <span className={`w-48-px h-48-px rounded-circle d-flex align-items-center justify-content-center ${toneClasses[stat.tone]}`}>
                  <Icon icon={stat.icon} className="text-2xl" />
                </span>
                <span className="text-success-main bg-success-focus px-10 py-4 rounded-pill text-xs fw-semibold">{stat.change}</span>
              </div>
              <p className="text-secondary-light mb-6">{stat.label}</p>
              <h3 className="mb-0">{stat.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>

    <div className="row gy-4 mb-24">
      <div className="col-xl-8">
        <div className="card h-100">
          <div className="card-header border-bottom bg-base py-16 px-24">
            <div className="d-flex justify-content-between align-items-center gap-3">
              <div>
                <h6 className="mb-2">Platform activity</h6>
                <p className="text-sm text-secondary-light mb-0">New users and completed calls over the last 7 days</p>
              </div>
              <span className="text-xs bg-neutral-100 px-12 py-6 rounded-pill">Last 7 days</span>
            </div>
          </div>
          <div className="card-body p-24">
            <ReactApexChart options={activityOptions} series={activitySeries} type="area" height={310} />
          </div>
        </div>
      </div>

      <div className="col-xl-4">
        <div className="card h-100">
          <div className="card-header border-bottom bg-base py-16 px-24">
            <h6 className="mb-2">Money movement</h6>
            <p className="text-sm text-secondary-light mb-0">Today by transaction category</p>
          </div>
          <div className="card-body p-24">
            <ReactApexChart options={revenueOptions} series={[58, 29, 9, 4]} type="donut" height={300} />
          </div>
        </div>
      </div>
    </div>

    <div className="row gy-4">
      <div className="col-xl-8">
        <div className="card h-100">
          <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center justify-content-between gap-3">
            <div>
              <h6 className="mb-2">Approval queue</h6>
              <p className="text-sm text-secondary-light mb-0">Oldest pending operational reviews</p>
            </div>
            <span className="bg-warning-focus text-warning-main px-12 py-4 rounded-pill fw-semibold text-xs">12 pending</span>
          </div>
          <div className="card-body p-0">
            {approvalQueue.map((item) => (
              <Link to={item.route} key={item.item} className="px-24 py-16 border-bottom d-flex align-items-center justify-content-between gap-3 text-decoration-none hover-bg-neutral-50">
                <div className="d-flex align-items-center gap-12">
                  <span className={`w-40-px h-40-px rounded-circle d-flex align-items-center justify-content-center ${toneClasses[item.tone]}`}>
                    <Icon icon="solar:document-add-outline" />
                  </span>
                  <div>
                    <div className="fw-semibold text-primary-light">{item.type}</div>
                    <div className="text-sm text-secondary-light">{item.item} · {item.user}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-12">
                  <span className="text-sm text-secondary-light">{item.age}</span>
                  <Icon icon="solar:alt-arrow-right-linear" className="text-secondary-light" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="col-xl-4">
        <div className="card h-100">
          <div className="card-header border-bottom bg-base py-16 px-24">
            <h6 className="mb-2">Trust snapshot</h6>
            <p className="text-sm text-secondary-light mb-0">Verification and safety health</p>
          </div>
          <div className="card-body p-24">
            {[
              ["ID verified users", "18,614", "74.8%", "success"],
              ["Voice verified users", "14,921", "59.9%", "info"],
              ["Pending verifications", "8", "Review", "warning"],
              ["Suspended accounts", "126", "0.5%", "danger"],
            ].map(([label, value, meta, tone]) => (
              <div className="d-flex align-items-center justify-content-between gap-3 py-14 border-bottom" key={label}>
                <div>
                  <p className="text-sm text-secondary-light mb-3">{label}</p>
                  <h6 className="mb-0">{value}</h6>
                </div>
                <span className={`bg-${tone}-focus text-${tone}-main px-10 py-4 rounded-pill text-xs fw-semibold`}>{meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </MasterLayout>
);

export default AdminDashboardPage;
