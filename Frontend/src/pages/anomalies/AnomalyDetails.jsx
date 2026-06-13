import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import SeverityBadge from '../../components/anomalies/SeverityBadge';
import AnomalyStatusBadge from '../../components/anomalies/AnomalyStatusBadge';
import ApproveModal from '../../components/anomalies/ApproveModal';
import RejectModal from '../../components/anomalies/RejectModal';
import { useAnomalies } from '../../hooks/useAnomalies';

const formatTypeName = (type) => {
  if (!type) return '';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AnomalyDetails = () => {
  const { anomalyId } = useParams();
  const navigate = useNavigate();
  const { fetchAnomalyDetails, resolveAnomalyAction, loading, error } = useAnomalies();
  const [anomaly, setAnomaly] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Modal control states
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);

  const loadDetails = async () => {
    try {
      const data = await fetchAnomalyDetails(anomalyId);
      setAnomaly(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [anomalyId]);

  const handleResolve = async (action, note) => {
    setActionError(null);
    try {
      await resolveAnomalyAction(anomalyId, action, note);
      setIsApproveOpen(false);
      setIsRejectOpen(false);
      loadDetails();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || 'Resolution failed. Please check notes requirement.');
    }
  };

  if (loading && !anomaly) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-[40%] mb-4"></div>
        <div className="h-[300px] bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  if (error && !anomaly) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-2xl flex flex-col gap-4">
        <span>{error}</span>
        <Link to="/anomalies" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline">
          Back to Queue
        </Link>
      </div>
    );
  }

  if (!anomaly) return null;

  // Parse Raw Content representation if available
  let parsedRow = null;
  if (anomaly.importRow?.rawContent) {
    try {
      parsedRow = JSON.parse(anomaly.importRow.rawContent);
    } catch (e) {
      console.error('Failed to parse rawContent JSON', e);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`${formatTypeName(anomaly.type)} Review`}
        subtitle={`Audit Item ID #${anomaly.id} generated for CSV import #${anomaly.importRow?.importId || 'N/A'}`}
        actions={
          <button
            onClick={() => navigate(-1)}
            className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            Back
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Details Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900/65 pb-3">
              Anomaly Analysis Metadata
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</span>
                <SeverityBadge severity={anomaly.severity} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Audit Status</span>
                <AnomalyStatusBadge status={anomaly.status} />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CSV Line Row</span>
                <span className="text-sm font-black text-slate-200">
                  Row #{anomaly.importRow?.rowNumber || anomaly.rowNumber || 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Warning Message</span>
              <p className="text-sm text-slate-200 bg-slate-950/50 p-4 rounded-xl border border-slate-900 leading-relaxed">
                {anomaly.description}
              </p>
            </div>

            {/* Suggested Action */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">Suggested Correction Action</span>
              <p className="text-sm text-indigo-400 bg-indigo-950/10 p-4 rounded-xl border border-indigo-950/20 leading-relaxed font-semibold">
                {anomaly.suggestedAction || 'Verify transaction authenticity before ledger reconciliation.'}
              </p>
            </div>
          </div>

          {/* Raw Row Data Viewer */}
          {parsedRow && (
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-900/60 pb-3">
                Imported CSV Row Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(parsedRow).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center bg-slate-950/20 border border-slate-900 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{key}</span>
                    <span className="text-xs font-bold text-slate-200 truncate max-w-[180px]">{String(val || 'N/A')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Resolution State Panel */}
        <div className="flex flex-col gap-6">
          
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-5">
            <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider border-b border-slate-900/60 pb-3">
              Resolution State
            </h3>

            {anomaly.status === 'PENDING' ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  This warning remains **Pending Review**. Group members must either approve the transaction note overriding the alert or reject it.
                </p>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    onClick={() => setIsApproveOpen(true)}
                    className="px-4.5 py-3 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-450 shadow-sm transition-all"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setIsRejectOpen(true)}
                    className="px-4.5 py-3 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500 hover:text-white border border-red-500/20 text-red-400 shadow-sm transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-900 bg-slate-950/40 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status Outcome</span>
                    <AnomalyStatusBadge status={anomaly.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resolved By</span>
                    <span className="font-semibold text-slate-300">
                      {anomaly.resolvedBy?.name || `User ID #${anomaly.resolvedById}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Resolution Date</span>
                    <span className="font-semibold text-slate-300">
                      {anomaly.resolvedAt ? new Date(anomaly.resolvedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Auditor Log Comment</span>
                  <p className="p-4 rounded-xl border border-slate-900 bg-slate-950/50 italic text-slate-300 leading-relaxed font-semibold">
                    "{anomaly.resolutionNote || 'No explanation log details provided.'}"
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Back links */}
          <div className="p-4.5 rounded-2xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trace Links</span>
            <Link
              to={`/imports/${anomaly.importRow?.importId}`}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View CSV Import Job #{anomaly.importRow?.importId}
            </Link>
          </div>

        </div>

      </div>

      {/* Approve Modal Overlay */}
      <ApproveModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onSubmit={(note) => handleResolve('APPROVE', note)}
        loading={loading}
        error={actionError}
      />

      {/* Reject Modal Overlay */}
      <RejectModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onSubmit={(note) => handleResolve('REJECT', note)}
        loading={loading}
        error={actionError}
      />
    </div>
  );
};

export default AnomalyDetails;
