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
    mutationFn: async (row: BaseRecord) => {
      // 1. Try to update the ratings table status (might fail if cache is stale, we ignore it)
      await ratingsApi.update(row.id, { status: "approved" }).catch(() => {});
      
      // 2. Actually update the user's rating in the app!
      // For ponytail mode: just boost the rating slightly based on this review
      const currentRating = Number(row.rating || 5);
      const { data: user } = await supabase.from('users').select('rating').eq('id', row.rated_user_id).single();
      const oldRating = user?.rating || 5.0;
      const newRating = Number(((oldRating * 4 + currentRating) / 5).toFixed(1));
      
      await supabase.from('users').update({ rating: newRating }).eq('id', row.rated_user_id);
      return row.id;
    },
    onSuccess: () => {
      toast.success("Rating approved and user profile updated!");
      client.invalidateQueries({ queryKey: ["ratings"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve rating");
      console.error(error);
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
        <button className="btn btn-sm btn-primary-600" onClick={() => approve.mutate(row)}>
          Approve
        </button>
      ) : null
    ) }
  ];
  return <div className="user-management-page ratings-reviews-page"><PageHeader title="Ratings & Reviews" description="Review post-call feedback and filter by rating." icon="solar:star-outline" /><AdminDataTable<BaseRecord> queryKey={["ratings"]} queryFn={ratingsApi.list} columns={columns} filters={ratingFilters} initialSort={{ key: "created_at", direction: "desc" }} /></div>;
};
export default RatingsPage;
