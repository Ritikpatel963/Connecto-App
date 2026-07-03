import React, { useEffect, useState } from "react";
import ThemeModal from "./ThemeModal";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: "primary" | "success" | "danger" | "warning";
  requireReason?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading?: boolean;
  children?: React.ReactNode;
}

const ActionModal = ({ open, title, description, confirmLabel, tone = "primary", requireReason, onClose, onConfirm, loading, children }: Props) => {
  const [reason, setReason] = useState("");
  useEffect(() => { if (!open) setReason(""); }, [open]);

  return (
    <ThemeModal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancel</button>
          <button type="button" className={`btn btn-${tone === "primary" ? "primary-600" : tone}`} disabled={loading || Boolean(requireReason && !reason.trim())} onClick={() => onConfirm(reason.trim())}>
            {loading ? "Saving..." : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-secondary-light">{description}</p>
      {children}
      {requireReason && (
        <div className="mt-20">
          <label className="form-label fw-semibold">Rejection reason <span className="text-danger-main">*</span></label>
          <textarea className="form-control" rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this request is being rejected..." />
        </div>
      )}
    </ThemeModal>
  );
};

export default ActionModal;
