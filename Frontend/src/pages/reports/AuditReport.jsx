import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import AuditTimeline from '../../components/reports/AuditTimeline';
import { useReports } from '../../hooks/useReports';

const statuses = {
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const MetaBadge = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 px-4 py-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
    <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-200 truncate">{value}</span>
  </div>
);

const AuditReport = () => {
  const { importId } = useParams();
  const { auditTrail, loading, error, fetchAuditTrail } = useReports();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (importId) {
      fetchAuditTrail(importId).catch(console.error);
    }
  }, [importId, fetchAuditTrail]);

  const filteredRows = auditTrail?.rows?.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      String(r.rowNumber).includes(s) ||
      (r.generatedRecord?.type || '').toLowerCase().includes(s) ||
      (r.anomalyHistory || []).some((a) => a.type?.toLowerCase().includes(s)) ||
      (r.isValid ? 'valid' : 'invalid').includes(s)
    );
  }) ?? [];

  const src = auditTrail?.sourceImport;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Audit Trail #${importId}`}
        subtitle="Row-by-row processing history with anomalies, resolutions, and generated records."
        actions={
          <div className="flex gap-2.5">
            <Link
              to={`/reports/import/${importId}`}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-indigo-500/30 text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-200 flex items-center gap-2"
            >
              📊 Import Report
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all duration-200"
            >
              ← Back
            </Link>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-slate-900 rounded-2xl" />
          <div className="h-[500px] bg-slate-900 rounded-2xl" />
        </div>
      ) : auditTrail ? (
        <div className="flex flex-col gap-6">
          {/* Source Import Meta */}
          {src && (
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{src.originalFilename}</p>
                    <p className="text-xs text-slate-500">Import #{src.importId} · Group #{src.groupId}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statuses[src.status] || statuses.PENDING}`}>
                  {src.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetaBadge label="Total Rows" value={src.totalRows ?? '—'} />
                <MetaBadge label="Imported" value={src.importedRowsCount ?? 0} />
                <MetaBadge label="Failed" value={src.failedRowsCount ?? 0} />
                <MetaBadge label="Uploaded By" value={src.uploadedBy?.name || 'Unknown'} />
              </div>
            </div>
          )}

          {/* Timeline Section */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Row-by-Row Timeline</h3>
                  <p className="text-xs text-slate-500">{filteredRows.length} rows · Click any row to expand details</p>
                </div>
              </div>
              <input
                type="text"
                placeholder="Search rows…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl bg-slate-950/60 border border-slate-700 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors w-full sm:w-56"
              />
            </div>
            <div className="p-5">
              <AuditTimeline rows={filteredRows} />
            </div>
          </div>
        </div>
      ) : !error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">🔍</div>
          <p className="text-slate-400 text-sm">No audit data for import #{importId}.</p>
        </div>
      ) : null}
    </div>
  );
};

export default AuditReport;
