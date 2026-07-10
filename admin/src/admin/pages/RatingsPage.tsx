import React from "react";
import { ratingsApi } from "../api/ratings";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, PersonCell, RatingCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import { BaseRecord, SelectFilter } from "../types";
import StatusBadge from "../components/StatusBadge";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ratingFilters: SelectFilter[] = [{ key: "rating", label: "Rating", options: [1, 2, 3, 4, 5].map((value) => ({ label: `${value} stars`, value: String(value) })) }];

const RatingsPage = () => {
  const client = useQueryClient();
  const approve = useMutation({
    mutationFn: (id: string | number) => ratingsApi.update(id, { status: "approved" }),
    onSuccess: () => {
      toast.success("Rating approved");
      client.invalidateQueries({ queryKey: ["ratings"] });
    }
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "rater", label: "Rater", render: (row: BaseRecord) => <PersonCell name={row.rater} /> },
    { key: "rated", label: "Rated user", render: (row: BaseRecord) => <PersonCell name={row.rated} /> },
    { key: "rating", label: "Rating", render: (row: BaseRecord) => <RatingCell value={row.rating} /> },
    { key: "review_text", label: "Review", className: "min-w-240-px" },
    { key: "status", label: "Status", render: (row: BaseRecord) => <StatusBadge value={String(row.status || "pending")} /> },
    { key: "created_at", label: "Date", render: (row: BaseRecord) => <DateCell value={row.created_at} /> },
    { key: "actions", label: "Actions", render: (row: BaseRecord) => (
      row.status !== "approved" ? (
        <button className="btn btn-sm btn-primary-600" onClick={() => approve.mutate(row.id)}>
          Approve
        </button>
      ) : null
    ) }
  ];
  return <div className="user-management-page ratings-reviews-page"><PageHeader title="Ratings & Reviews" description="Review post-call feedback and filter by rating." icon="solar:star-outline" /><AdminDataTable<BaseRecord> queryKey={["ratings"]} queryFn={ratingsApi.list} columns={columns} filters={ratingFilters} initialSort={{ key: "created_at", direction: "desc" }} /></div>;
};
export default RatingsPage;
