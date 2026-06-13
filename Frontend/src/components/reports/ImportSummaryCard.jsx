import React from 'react';
import { Link } from 'react-router-dom';

const statusStyles = {
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  PROCESSING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20',
  PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

/**
 * ImportSummaryCard — shows a single import's summary metadata.
 * Props: importId, originalFilename, status, totalRows, importedRowsCount, failedRowsCount, uploadedBy, createdAt
 */
const ImportSummaryCard = ({ importId, originalFilename, status, totalRows, importedRowsCount, failedRowsCount, uploadedBy, createdAt }) => {
  const statusClass = statusStyles[status] || statusStyles.PENDING;
  const successRate = totalRows > 0 ? Math.round((importedRowsCount / totalRows) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-5 hover:border-slate-700 transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-100 truncate">{originalFilename}</p>
            <p className="text-xs text-slate-500 mt-0.5">Import #{importId}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${statusClass}`}>
          {status}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total', value: totalRows ?? '—' },
          { label: 'Imported', value: importedRowsCount ?? 0, color: 'text-emerald-400' },
          { label: 'Failed', value: failedRowsCount ?? 0, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
            <p className={`text-lg font-bold ${color || 'text-slate-100'}`}>{value}</p>
            <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
          <span>Success rate</span>
          <span className="font-semibold text-slate-300">{successRate}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500">
          <span className="text-slate-400 font-medium">{uploadedBy?.name || 'Unknown'}</span>
          <span className="mx-1.5">·</span>
          <span>{createdAt ? new Date(createdAt).toLocaleDateString() : '—'}</span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/reports/import/${importId}`}
            className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
          >
            Report
          </Link>
          <Link
            to={`/reports/audit/${importId}`}
            className="text-[10px] font-semibold text-violet-400 hover:text-violet-300 px-2.5 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
          >
            Audit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ImportSummaryCard;
