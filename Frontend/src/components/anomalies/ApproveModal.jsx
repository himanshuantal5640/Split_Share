import React from 'react';
import ResolutionNotesForm from './ResolutionNotesForm';

const ApproveModal = ({ isOpen, onClose, onSubmit, loading = false, error = null }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative max-w-md w-full p-6 rounded-2xl border border-slate-900 bg-slate-950 shadow-2xl flex flex-col gap-5 z-10 animate-scale-up">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            Approve Anomaly
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Approving an anomaly overrides the detection engine warning. The row will be marked as approved, allowing it to be processed during expense generation. A detailed resolution note is required.
        </p>

        {error && (
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-xs leading-relaxed flex items-start gap-2.5">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <ResolutionNotesForm
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel="Approve"
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ApproveModal;
