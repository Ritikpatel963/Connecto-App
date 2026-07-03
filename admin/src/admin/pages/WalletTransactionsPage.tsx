import React from "react";
import { walletTransactionsApi } from "../api/wallet";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, MoneyCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { SelectFilter, WalletTransaction } from "../types";

const filters: SelectFilter[] = [
  { key: "transaction_type", label: "Type", options: ["recharge", "call_deduction", "refund", "referral_reward"].map((value) => ({ label: value.replaceAll("_", " "), value })) },
  { key: "verification_status", label: "Status", options: ["pending", "verified", "rejected"].map((value) => ({ label: value, value })) },
];

const WalletTransactionsPage = () => {
  const columns = [
    { key: "id", label: "Transaction" }, { key: "wallet_id", label: "Wallet" },
    { key: "transaction_type", label: "Type", render: (row: WalletTransaction) => <StatusBadge value={row.transaction_type} /> },
    { key: "amount", label: "Amount", render: (row: WalletTransaction) => <MoneyCell value={row.amount} /> },
    { key: "payment_method", label: "Method" },
    { key: "verification_status", label: "Verification", render: (row: WalletTransaction) => <StatusBadge value={row.verification_status} /> },
    { key: "created_at", label: "Created", render: (row: WalletTransaction) => <DateCell value={row.created_at} /> },
  ];
  return <><PageHeader title="Wallet Transactions" description="All recharge, deduction, refund and referral reward movements." icon="solar:card-transfer-outline" /><AdminDataTable<WalletTransaction> queryKey={["wallet-transactions"]} queryFn={walletTransactionsApi.list} columns={columns} filters={filters} initialSort={{ key: "created_at", direction: "desc" }} /></>;
};
export default WalletTransactionsPage;
