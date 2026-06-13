import React from 'react';

const statusStyles = {
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/20',
};

/**
 * ResolutionSummaryTable — renders resolved anomaly rows with notes and resolver info.
 * Props: resolutions[]
 */
const ResolutionSummaryTable = ({ resolutions = [] }) => {
  if (resolutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">No resolutions yet</p>
          <p className="text-xs text-slate-500 mt-0.5">Anomalies are still pending review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            {['Anomaly', 'Row', 'Type', 'Decision', 'Note', 'Resolved By', 'Date'].map((h) => (
              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 pb-3 pr-4 last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resolutions.map((r, idx) => (
            <tr key={r.anomalyId || idx} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
              <td className="py-3 pr-4 text-xs font-mono text-slate-400">#{r.anomalyId}</td>
              <td className="py-3 pr-4 text-xs font-mono text-slate-300">#{r.rowNumber ?? '—'}</td>
              <td className="py-3 pr-4">
                <span className="text-xs font-medium text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded-md">
                  {r.type?.replace(/_/g, ' ')}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusStyles[r.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  {r.status}
                </span>
              </td>
              <td className="py-3 pr-4 text-xs text-slate-400 max-w-[180px] truncate" title={r.resolutionNote}>
                {r.resolutionNote || <span className="italic text-slate-600">No note</span>}
              </td>
              <td className="py-3 pr-4 text-xs text-slate-400">
                {r.resolvedBy?.name || <span className="italic text-slate-600">Unknown</span>}
              </td>
              <td className="py-3 text-xs text-slate-500">
                {r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResolutionSummaryTable;
