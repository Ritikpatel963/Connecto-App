import React from "react";
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
  const filters: SelectFilter[] = [{ key: "status", label: "Status", options: ["pending", "qualified", "rejected"].map((value) => ({ label: value, value })) }];
  return <><PageHeader title="Referrals" description="Track invited users from signup through ID-qualified status." icon="solar:share-circle-outline" /><AdminDataTable<BaseRecord> queryKey={["referrals"]} queryFn={referralsApi.list} columns={columns} filters={filters} initialSort={{ key: "created_at", direction: "desc" }} /></>;
};
export default ReferralsPage;
