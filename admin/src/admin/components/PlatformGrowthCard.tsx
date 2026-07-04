import React from "react";
import { Icon } from "@iconify/react";
import ReactApexChart from "react-apexcharts";

/* Set this to false to instantly restore the original Platform growth card. */
const USE_ENHANCED_PLATFORM_GROWTH = true;

const fontFamily = "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const categories = ["27 Jun", "28 Jun", "29 Jun", "30 Jun", "1 Jul", "2 Jul", "3 Jul"];
const newUsers = [182, 214, 198, 246, 274, 308, 341];
const completedCalls = [1240, 1488, 1392, 1760, 1884, 2010, 2268];

const total = (values: number[]) => values.reduce((sum, value) => sum + value, 0);
const dailyChange = (values: number[]) => ((values[values.length - 1] - values[values.length - 2]) / values[values.length - 2]) * 100;
const formatNumber = (value: number) => value.toLocaleString("en-IN");
const formatCompact = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : String(value);

const MetricSummary = ({ label, value, change, tone }: { label: string; value: number; change: number; tone: "primary" | "success" }) => (
  <div className="growth-summary-item">
    <span className={`growth-summary-icon bg-${tone}-focus text-${tone}-main`}><Icon icon={tone === "primary" ? "solar:users-group-rounded-bold" : "solar:phone-calling-bold"} /></span>
    <span className="growth-summary-copy">
      <span className="growth-summary-label">{label}</span>
      <span className="growth-summary-value">{formatNumber(value)}</span>
    </span>
    <span className="growth-summary-trend text-success-main"><Icon icon="solar:arrow-right-up-linear" />{change.toFixed(1)}%</span>
  </div>
);

const enhancedOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily,
  },
  colors: ["#487FFF", "#45B369"],
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" as const, width: [0, 3] },
  fill: {
    type: ["solid", "gradient"],
    opacity: [0.82, 0.28],
    gradient: { shadeIntensity: 1, opacityFrom: 0.42, opacityTo: 0.05, stops: [0, 95, 100] },
  },
  plotOptions: { bar: { columnWidth: "42%", borderRadius: 5, borderRadiusApplication: "end" as const } },
  markers: { size: [0, 4], strokeWidth: 3, hover: { size: 6 } },
  grid: { borderColor: "#e5e7eb", strokeDashArray: 4, padding: { left: 8, right: 18 } },
  xaxis: {
    categories,
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: "#808096", fontSize: "12px" } },
  },
  yaxis: [
    {
      seriesName: "New users",
      min: 0,
      tickAmount: 4,
      labels: { formatter: formatCompact, minWidth: 30, maxWidth: 42, style: { colors: "#808096", fontSize: "11px" } },
    },
    {
      seriesName: "Completed calls",
      opposite: true,
      min: 0,
      tickAmount: 4,
      labels: { formatter: formatCompact, minWidth: 30, maxWidth: 42, style: { colors: "#808096", fontSize: "11px" } },
    },
  ],
  legend: { show: false },
  tooltip: {
    shared: true,
    intersect: false,
    y: { formatter: (value: number) => formatNumber(value) },
  },
};

const enhancedSeries = [
  { name: "New users", type: "column", data: newUsers },
  { name: "Completed calls", type: "area", data: completedCalls },
];

const EnhancedPlatformGrowthCard = () => (
  <div className="card h-100 platform-growth-card">
    <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-start justify-content-between gap-3">
      <div><h6 className="mb-2">Platform growth</h6><p className="text-sm text-secondary-light mb-0">Acquisition and call activity over the last seven days</p></div>
      <span className="growth-range-badge"><Icon icon="solar:calendar-linear" />Last 7 days</span>
    </div>
    <div className="card-body p-24">
      <div className="growth-summary-grid">
        <MetricSummary label="New users" value={total(newUsers)} change={dailyChange(newUsers)} tone="primary" />
        <MetricSummary label="Completed calls" value={total(completedCalls)} change={dailyChange(completedCalls)} tone="success" />
      </div>
      <div className="growth-chart-wrap">
        <ReactApexChart options={enhancedOptions} series={enhancedSeries} type="line" height={275} />
      </div>
    </div>
  </div>
);

/* Original implementation retained for safe, one-line rollback. */
const legacyOptions = {
  chart: { toolbar: { show: false }, fontFamily },
  colors: ["#487FFF", "#45B369"],
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" as const, width: 3 },
  grid: { borderColor: "#e5e7eb", strokeDashArray: 4 },
  xaxis: { categories },
  legend: { position: "top" as const, horizontalAlign: "right" as const },
};
const legacySeries = [{ name: "New users", data: newUsers }, { name: "Completed calls", data: completedCalls }];

const LegacyPlatformGrowthCard = () => (
  <div className="card h-100">
    <div className="card-header border-bottom bg-base py-16 px-24"><h6 className="mb-2">Platform growth</h6><p className="text-sm text-secondary-light mb-0">Users and completed calls, last seven days</p></div>
    <div className="card-body p-24"><ReactApexChart options={legacyOptions} series={legacySeries} type="area" height={315} /></div>
  </div>
);

const PlatformGrowthCard = () => USE_ENHANCED_PLATFORM_GROWTH ? <EnhancedPlatformGrowthCard /> : <LegacyPlatformGrowthCard />;

export default PlatformGrowthCard;
