import React from 'react';

const severityStyles = {
  LOW: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusStyles = {
  PENDING: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

/**
 * AnomalySummaryTable — renders the anomaly rows for an import report.
 * Props: anomalies[]
 */
const AnomalySummaryTable = ({ anomalies = [] }) => {
  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">No anomalies detected</p>
          <p className="text-xs text-slate-500 mt-0.5">All rows passed validation checks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            {['Row', 'Type', 'Severity', 'Description', 'Status', 'Detected'].map((h) => (
              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 pb-3 pr-4 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {anomalies.map((a, idx) => (
            <tr
              key={a.id || idx}
              className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
            >
              <td className="py-3 pr-4 text-slate-300 font-mono text-xs">#{a.rowNumber ?? '—'}</td>
              <td className="py-3 pr-4">
                <span className="text-xs font-medium text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-md">
                  {a.type?.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${severityStyles[a.severity] || severityStyles.LOW}`}>
                  {a.severity}
                </span>
              </td>
              <td className="py-3 pr-4 text-xs text-slate-400 max-w-xs truncate">{a.description}</td>
              <td className="py-3 pr-4">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyles[a.status] || statusStyles.PENDING}`}>
                  {a.status}
                </span>
              </td>
              <td className="py-3 text-xs text-slate-500">
                {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnomalySummaryTable;
