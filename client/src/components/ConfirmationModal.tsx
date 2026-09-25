import React from 'react';

interface ConfirmationModalProps {
  show: boolean;
  title: string;
  message: string;
  warningText?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  title,
  message,
  warningText,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }} onClick={onCancel} />
      <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content erp-card border-0 shadow">
            <div className="modal-header border-bottom py-3">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                disabled={isLoading}
                onClick={onCancel}
              />
            </div>
            <div className="modal-body py-4">
              <p className="mb-2 text-secondary">{message}</p>
              {warningText && (
                <div className="alert alert-warning py-2 px-3 small mt-3 mb-0">
                  ⚠️ {warningText}
                </div>
              )}
            </div>
            <div className="modal-footer border-top py-2 bg-light">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                disabled={isLoading}
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn btn-sm btn-${confirmVariant} px-3`}
                disabled={isLoading}
                onClick={onConfirm}
              >
                {isLoading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
