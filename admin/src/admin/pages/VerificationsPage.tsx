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
const hasUploadedAsset = (url?: string) => Boolean(url && !url.startsWith("/demo/"));

const DemoAssetNotice = ({ type }: { type: "id" | "voice" }) => <div className="text-center py-32">
  <Icon icon={type === "id" ? "solar:gallery-wide-outline" : "solar:microphone-3-outline"} className="text-5xl text-secondary-light mb-12" />
  <p className="fw-semibold mb-4">Demo {type === "id" ? "identity document" : "voice recording"}</p>
  <p className="text-sm text-secondary-light mb-0">No physical file was uploaded for this seeded record.</p>
</div>;

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

  return <div className="user-management-page verification-page">
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
    <ActionModal open={Boolean(action)} title={action?.mode === "view" ? "Verification submission" : action?.mode === "approve" ? "Approve verification" : "Reject verification"} description={action ? `${action.row.id} \u00B7 ${action.row.user || `User #${action.row.user_id}`}` : ""} confirmLabel={action?.mode === "view" ? "Close" : action?.mode === "approve" ? "Approve" : "Reject"} tone={action?.mode === "reject" ? "danger" : "success"} requireReason={action?.mode === "reject"} onClose={() => setAction(null)} onConfirm={(reason) => action?.mode === "view" ? setAction(null) : mutation.mutate(reason)} loading={mutation.isPending}>
      {action && <div className="bg-neutral-50 radius-12 p-20">
        {type === "id"
          ? hasUploadedAsset(action.row.id_image_url)
            ? <div className="text-center py-32"><Icon icon="solar:gallery-wide-outline" className="text-5xl text-primary-600 mb-12" /><p className="fw-semibold mb-4">{action.row.document || "Identity document"}</p><a href={action.row.id_image_url} target="_blank" rel="noreferrer" className="text-primary-600">Open submitted image</a></div>
            : <DemoAssetNotice type="id" />
          : hasUploadedAsset(action.row.voice_audio_url)
            ? <div><audio controls className="w-100"><source src={action.row.voice_audio_url} /></audio><p className="text-sm text-secondary-light mt-12 mb-0">{action.row.sample || "Voice recording"}</p></div>
            : <DemoAssetNotice type="voice" />}
        {action.row.rejection_reason && <div className="alert alert-danger mt-16 mb-0">{action.row.rejection_reason}</div>}
      </div>}
    </ActionModal>
  </div>;
};
export default VerificationsPage;
