import React from "react";

interface Props {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
  size?: "sm" | "lg" | "xl";
}

const ThemeModal = ({ open, title, children, onClose, footer, size = "lg" }: Props) => {
  if (!open) return null;
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" aria-modal="true">
        <div className={`modal-dialog modal-dialog-centered modal-${size}`}>
          <div className="modal-content bg-base">
            <div className="modal-header border-bottom">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body p-24">{children}</div>
            {footer && <div className="modal-footer border-top">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default ThemeModal;
