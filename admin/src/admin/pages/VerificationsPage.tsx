import React, { useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { idVerificationsApi, voiceVerificationsApi } from "../api/verifications";
import AdminDataTable from "../components/AdminDataTable";
import ActionModal from "../components/ActionModal";
import { DateCell, IconButton, PersonCell } from "../components/Cells";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { SelectFilter, Verification } from "../types";

const statusFilter: SelectFilter[] = [{ key: "status", label: "Status", options: ["pending", "approved", "rejected"].map((value) => ({ label: value[0].toUpperCase() + value.slice(1), value })) }];

const VerificationsPage = ({ type }: { type: "id" | "voice" }) => {
  const api = type === "id" ? idVerificationsApi : voiceVerificationsApi;
  const key = type === "id" ? "id-verifications" : "voice-verifications";
  const client = useQueryClient();
  const [action, setAction] = useState<{ row: Verification; mode: "view" | "approve" | "reject" } | null>(null);

  const mutation = useMutation({
    mutationFn: (reason: string) => action?.mode === "reject" ? api.reject(action.row.id, reason) : api.approve(action!.row.id),
    onSuccess: () => { toast.success("Verification updated"); setAction(null); client.invalidateQueries({ queryKey: [key] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  const columns = [
    { key: "id", label: "Request" },
    { key: "user", label: "User", render: (row: Verification) => <PersonCell name={row.user} subtitle={row.id} /> },
    { key: type === "id" ? "document" : "sample", label: type === "id" ? "Document" : "Audio sample" },
    { key: "status", label: "Status", render: (row: Verification) => <StatusBadge value={row.status} /> },
    { key: "submitted_at", label: "Submitted", render: (row: Verification) => <DateCell value={row.submitted_at} /> },
    { key: "reviewed_by_admin", label: "Reviewed by" },
    { key: "reviewed_at", label: "Reviewed at", render: (row: Verification) => <DateCell value={row.reviewed_at} /> },
  ];

  return <>
    <PageHeader title={type === "id" ? "ID Verifications" : "Voice Verifications"} description={type === "id" ? "Review identity document submissions and audit completed decisions." : "Play submitted voice samples and approve or reject verification."} icon={type === "id" ? "solar:shield-user-outline" : "solar:microphone-3-outline"} />
    <AdminDataTable<Verification>
      queryKey={[key]}
      queryFn={api.list}
      columns={columns}
      filters={statusFilter}
      initialSort={{ key: "submitted_at", direction: "desc" }}
      renderActions={(row) => <>
        <IconButton icon="iconamoon:eye-light" title="View submission" onClick={() => setAction({ row, mode: "view" })} />
        {row.status === "pending" && <><IconButton icon="solar:check-circle-outline" title="Approve" tone="success" onClick={() => setAction({ row, mode: "approve" })} /><IconButton icon="solar:close-circle-outline" title="Reject" tone="danger" onClick={() => setAction({ row, mode: "reject" })} /></>}
      </>}
    />
    <ActionModal open={Boolean(action)} title={action?.mode === "view" ? "Verification submission" : action?.mode === "approve" ? "Approve verification" : "Reject verification"} description={action ? `${action.row.id} · ${action.row.user}` : ""} confirmLabel={action?.mode === "view" ? "Close" : action?.mode === "approve" ? "Approve" : "Reject"} tone={action?.mode === "reject" ? "danger" : "success"} requireReason={action?.mode === "reject"} onClose={() => setAction(null)} onConfirm={(reason) => action?.mode === "view" ? setAction(null) : mutation.mutate(reason)} loading={mutation.isPending}>
      {action && <div className="bg-neutral-50 radius-12 p-20">
        {type === "id" ? <div className="text-center py-32"><Icon icon="solar:gallery-wide-outline" className="text-5xl text-primary-600 mb-12" /><p className="fw-semibold mb-4">{action.row.document}</p><a href={action.row.id_image_url} className="text-primary-600">Open submitted image</a></div> : <div><audio controls className="w-100"><source src={action.row.voice_audio_url} /></audio><p className="text-sm text-secondary-light mt-12 mb-0">{action.row.sample}</p></div>}
        {action.row.rejection_reason && <div className="alert alert-danger mt-16 mb-0">{action.row.rejection_reason}</div>}
      </div>}
    </ActionModal>
  </>;
};
export default VerificationsPage;
