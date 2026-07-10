import React, { useState } from "react";
import { ratingsApi } from "../api/ratings";
import AdminDataTable from "../components/AdminDataTable";
import { DateCell, PersonCell, RatingCell, IconButton } from "../components/Cells";
import ActionModal from "../components/ActionModal";
import ThemeModal from "../components/ThemeModal";
import PageHeader from "../components/PageHeader";
import { BaseRecord, SelectFilter } from "../types";
import StatusBadge from "../components/StatusBadge";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";

const ratingFilters: SelectFilter[] = [{ key: "rating", label: "Rating", options: [1, 2, 3, 4, 5].map((value) => ({ label: `${value} stars`, value: String(value) })) }];

const isRowApproved = (row: BaseRecord) => String(row.review_text || "").startsWith("[APPROVED]");
const getReviewText = (row: BaseRecord) => String(row.review_text || "").replace("[APPROVED] ", "") || "";

const RatingsPage = () => {
  const client = useQueryClient();
  const [deleting, setDeleting] = useState<BaseRecord | null>(null);
  const [editing, setEditing] = useState<BaseRecord | null>(null);
  const [editForm, setEditForm] = useState({ review_text: "", rating: 5 });

  const approve = useMutation({
    mutationFn: async (row: BaseRecord) => {
      // Store the approval state in the review_text since status column is missing
      await ratingsApi.update(row.id, { review_text: "[APPROVED] " + getReviewText(row) });
      
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

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => ratingsApi.remove(id),
    onSuccess: () => {
      toast.success("Rating deleted");
      setDeleting(null);
      client.invalidateQueries({ queryKey: ["ratings"] });
    }
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const prefix = isRowApproved(editing) ? "[APPROVED] " : "";
      return ratingsApi.update(editing.id, { 
        rating: editForm.rating, 
        review_text: prefix + editForm.review_text 
      });
    },
    onSuccess: () => {
      toast.success("Rating updated");
      setEditing(null);
      client.invalidateQueries({ queryKey: ["ratings"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update rating");
    }
  });

  const columns = [
    { key: "id", label: "ID" },
    { key: "rater", label: "Rater", render: (row: BaseRecord) => <PersonCell name={row.rater} /> },
    { key: "rated", label: "Rated user", render: (row: BaseRecord) => <PersonCell name={row.rated} /> },
    { key: "rating", label: "Rating", render: (row: BaseRecord) => <RatingCell value={row.rating} /> },
    { key: "review_text", label: "Review", className: "min-w-240-px", render: (row: BaseRecord) => <span>{getReviewText(row)}</span> },
    { key: "status", label: "Status", render: (row: BaseRecord) => <StatusBadge value={isRowApproved(row) ? "approved" : "pending"} /> },
    { key: "created_at", label: "Date", render: (row: BaseRecord) => <DateCell value={row.created_at} /> },
  ];
  return <div className="user-management-page ratings-reviews-page">
    <PageHeader title="Ratings & Reviews" description="Review post-call feedback and filter by rating." icon="solar:star-outline" />
    <AdminDataTable<BaseRecord> 
      queryKey={["ratings"]} 
      queryFn={ratingsApi.list} 
      columns={columns} 
      filters={ratingFilters} 
      initialSort={{ key: "created_at", direction: "desc" }} 
      renderActions={(row) => <>
        {!isRowApproved(row) && (
          <button className="btn btn-sm btn-primary-600" onClick={() => approve.mutate(row)} disabled={approve.isPending}>Approve</button>
        )}
        <IconButton icon="solar:pen-outline" title="Edit rating" onClick={() => {
          setEditing(row);
          setEditForm({ review_text: getReviewText(row), rating: Number(row.rating || 5) });
        }} />
        <IconButton icon="solar:trash-bin-trash-outline" title="Delete rating" tone="danger" onClick={() => setDeleting(row)} />
      </>}
    />
    <ActionModal 
      open={Boolean(deleting)} 
      title="Delete rating" 
      description={`Are you sure you want to delete this rating by ${deleting?.rater || 'this user'}?`} 
      confirmLabel="Delete" 
      tone="danger" 
      onClose={() => setDeleting(null)} 
      onConfirm={() => deleteMutation.mutate(deleting!.id)} 
      loading={deleteMutation.isPending} 
    />
    <ThemeModal 
      open={Boolean(editing)} 
      title="Edit Rating" 
      onClose={() => setEditing(null)} 
      footer={<>
        <button className="btn btn-outline-secondary" onClick={() => setEditing(null)}>Cancel</button>
        <button className="btn btn-primary-600" disabled={editMutation.isPending} onClick={() => editMutation.mutate()}>Save changes</button>
      </>}
    >
      <div className="row gy-3">
        <div className="col-12">
          <label className="form-label">Rating (1-5)</label>
          <input type="number" min={1} max={5} className="form-control" value={editForm.rating} onChange={(e) => setEditForm({...editForm, rating: Number(e.target.value)})} />
        </div>
        <div className="col-12">
          <label className="form-label">Review Text</label>
          <textarea className="form-control" rows={3} value={editForm.review_text} onChange={(e) => setEditForm({...editForm, review_text: e.target.value})} />
        </div>
      </div>
    </ThemeModal>
  </div>;
};
export default RatingsPage;
