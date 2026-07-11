import React from "react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { referralsApi } from "../api/referrals";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { BaseRecord, SelectFilter } from "../types";

const ReferralsPage = () => {
  const columns = [
    { key: "id", label: "Referral" },
    { key: "referrer", label: "Referrer", render: (row: BaseRecord) => <PersonCell name={row.referrer} /> },
    { key: "referred", label: "Referred user", render: (row: BaseRecord) => <PersonCell name={row.referred} /> },
    { key: "status", label: "Status", render: (row: BaseRecord) => <StatusBadge value={row.status} /> },
    { key: "qualified_at", label: "Qualified", render: (row: BaseRecord) => <DateCell value={row.qualified_at} /> },
    { key: "created_at", label: "Joined", render: (row: BaseRecord) => <DateCell value={row.created_at} /> },
  ];
  const filters: SelectFilter[] = [{ key: "status", label: "Status", options: ["pending", "successful"].map((value) => ({ label: value, value })) }];

  const { data: allReferrals } = useQuery({
    queryKey: ["all-referrals"],
    queryFn: async () => {
      const res = await referralsApi.list({ page: 1, pageSize: 10000 });
      return res.data;
    }
  });

  const total = allReferrals?.length || 0;
  const pending = allReferrals?.filter(r => r.status === 'pending').length || 0;
  const successful = allReferrals?.filter(r => r.status === 'successful' || r.status === 'completed').length || 0;
  const conversionRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  const metrics = [
    ["Total Referrals", total.toLocaleString(), "solar:users-group-rounded-bold", "primary"],
    ["Pending", pending.toLocaleString(), "solar:hourglass-bold", "warning"],
    ["Successful", successful.toLocaleString(), "solar:check-circle-bold", "success"],
    ["Conversion Rate", `${conversionRate}%`, "solar:chart-2-bold", "info"],
  ];

  return <div className="user-management-page referral-program-page">
    <PageHeader title="Referrals" description="Track invited users from signup through payment-qualified status." icon="solar:share-circle-outline" />
    
    <div className="row gy-4 mb-24">
      {metrics.map(([label, value, icon, tone]) => (
        <div className="col-xl-3 col-sm-6" key={String(label)}>
          <div className="card h-100">
            <div className="card-body p-20 dashboard-metric-card-body">
              <span className={`w-44-px h-44-px rounded-circle bg-${tone}-focus text-${tone}-main d-flex align-items-center justify-content-center mb-16`}>
                <Icon icon={String(icon)} className="text-xl" />
              </span>
              <p className="text-sm text-secondary-light mb-6">{label}</p>
              <h4 className="dashboard-metric-value mb-0">{value}</h4>
            </div>
          </div>
        </div>
      ))}
    </div>

    <AdminDataTable<BaseRecord> queryKey={["referrals"]} queryFn={referralsApi.list} columns={columns} filters={filters} initialSort={{ key: "created_at", direction: "desc" }} />
  </div>;
};
export default ReferralsPage;
