import React, { useState } from 'react';

const DeleteSettlementModal = ({ isOpen, onClose, onConfirm, settlement }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen || !settlement) return null;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm(settlement.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to delete settlement record.'
      );
    } finally {
      setLoading(false);
    }
  };

  const payerName = settlement.payer?.name || `User #${settlement.payerId}`;
  const payeeName = settlement.payee?.name || `User #${settlement.payeeId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative max-w-md w-full p-6 rounded-2xl border border-slate-900 bg-slate-950 shadow-2xl flex flex-col gap-5 z-10 animate-scale-up">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Delete Settlement</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {error && (
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-xs leading-relaxed flex items-start gap-2.5">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to delete this settlement record of{' '}
            <span className="text-white font-bold">
              {settlement.currency} {parseFloat(settlement.amount).toFixed(2)}
            </span>{' '}
            from <span className="text-indigo-400 font-semibold">{payerName}</span> to{' '}
            <span className="text-indigo-400 font-semibold">{payeeName}</span>?
          </p>
          
          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            * This represents a logical soft-delete. The transaction will be marked as deleted in the database and balances will be adjusted automatically.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-4 border-t border-slate-900 pt-4">
          <button
            onClick={onClose}
            className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="px-4.5 py-2.5 rounded-xl text-xs font-semibold bg-red-650 hover:bg-red-700 text-white shadow-lg shadow-red-950/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
          >
            {loading ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSettlementModal;
