import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import DeleteSettlementModal from '../../components/settlements/DeleteSettlementModal';
import { getSettlementDetails, deleteSettlement } from '../../api/settlementApi';

const SettlementDetails = () => {
  const { settlementId } = useParams();
  const navigate = useNavigate();

  const [settlement, setSettlement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSettlementDetails(parseInt(settlementId, 10));
      setSettlement(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to retrieve settlement details. Ensure it exists.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [settlementId]);

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteSettlement(id);
      navigate(`/settlements?groupId=${settlement.groupId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete settlement.');
    }
  };

  if (loading && !settlement) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-[40%] mb-4"></div>
        <div className="h-[250px] bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  if (error && !settlement) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-2xl flex flex-col gap-4">
        <span>{error}</span>
        <Link to="/settlements" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline">
          Back to Settlements
        </Link>
      </div>
    );
  }

  const payerName = settlement.payer?.name || `User #${settlement.payerId}`;
  const payeeName = settlement.payee?.name || `User #${settlement.payeeId}`;
  const transactionDate = new Date(settlement.transactionDate).toLocaleDateString(undefined, {
    dateStyle: 'full',
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <PageHeader
        title="Settlement Details"
        subtitle={`Transaction receipt recorded on ${transactionDate}`}
        actions={
          <div className="flex gap-3">
            <Link
              to={`/settlements?groupId=${settlement.groupId}`}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              Back
            </Link>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold bg-red-650 hover:bg-red-750 text-white shadow transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Settlement overview cards */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur shadow-xl flex flex-col gap-8 relative overflow-hidden">
            {/* Visual background gradient glow */}
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[80px]"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8 mt-2">
              {/* Payer User Details */}
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sender</span>
                <span className="text-lg font-extrabold text-slate-200">{payerName}</span>
                <span className="text-xs text-slate-500">{settlement.payer?.email || `ID: #${settlement.payerId}`}</span>
              </div>

              {/* Transaction Arrow */}
              <div className="flex flex-col items-center gap-1.5 py-2 px-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
                <svg className="w-6 h-6 text-emerald-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Paid Direct</span>
              </div>

              {/* Payee User Details */}
              <div className="flex flex-col items-center sm:items-end gap-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Receiver</span>
                <span className="text-lg font-extrabold text-slate-200">{payeeName}</span>
                <span className="text-xs text-slate-500">{settlement.payee?.email || `ID: #${settlement.payeeId}`}</span>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-slate-900 bg-slate-950/60 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Settlement Value</span>
                <span className="text-2xl font-black text-white">
                  {settlement.currency} {parseFloat(settlement.amount).toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-450">Expressed in original transaction currency</span>
              </div>

              <div className="p-5 rounded-xl border border-slate-900 bg-slate-950/60 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Normalized Value (INR)</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{parseFloat(settlement.normalizedAmount || settlement.amount).toFixed(2)} INR
                </span>
                <span className="text-[10px] text-slate-450">
                  {settlement.currency === 'INR' 
                    ? 'Base System Currency' 
                    : `Converted using rate ${parseFloat(settlement.exchangeRate || 1).toFixed(4)}`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata info card */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur shadow-xl flex flex-col gap-5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-900 pb-3">
              Transaction Metadata
            </h4>
            
            <div className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-450 font-medium">Record ID</span>
                <span className="text-slate-200 font-semibold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono">
                  #{settlement.id}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-450 font-medium">Status</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">
                  {settlement.isCompleted ? 'Completed' : 'Pending'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-450 font-medium">Source Type</span>
                {settlement.importId ? (
                  <span className="text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">
                    CSV Import
                  </span>
                ) : (
                  <span className="text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">
                    Manual Ledger
                  </span>
                )}
              </div>

              {settlement.importId && (
                <>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-450 font-medium">Import Job</span>
                    <span className="text-slate-200 font-semibold font-mono">
                      #{settlement.importId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-450 font-medium">Import Row</span>
                    <span className="text-slate-200 font-semibold font-mono">
                      #{settlement.importRowId}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-450 font-medium">Exchange Rate (INR)</span>
                <span className="text-slate-200 font-semibold">
                  {settlement.exchangeRate ? parseFloat(settlement.exchangeRate).toFixed(4) : '1.0000'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteSettlementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        settlement={settlement}
      />
    </div>
  );
};

export default SettlementDetails;
