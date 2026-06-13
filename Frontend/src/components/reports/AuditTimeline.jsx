import React, { useState } from 'react';

const rowStatusConfig = {
  valid_expense: { color: 'bg-emerald-500', label: 'Expense', icon: '💸' },
  valid_settlement: { color: 'bg-teal-500', label: 'Settlement', icon: '🤝' },
  anomaly: { color: 'bg-amber-500', label: 'Anomaly', icon: '⚠️' },
  invalid: { color: 'bg-red-500', label: 'Invalid', icon: '✗' },
  pending: { color: 'bg-slate-500', label: 'Pending', icon: '⏳' },
};

const EventDot = ({ type }) => {
  const cfg = rowStatusConfig[type] || rowStatusConfig.pending;
  return (
    <div className={`w-3 h-3 rounded-full ${cfg.color} ring-2 ring-slate-900 shrink-0`} />
  );
};

const AuditRowItem = ({ row, isLast }) => {
  const [expanded, setExpanded] = useState(false);

  const hasAnomalies = row.anomalyHistory?.length > 0;
  const hasResolutions = row.resolutionHistory?.length > 0;
  const hasRecord = !!row.generatedRecord;

  let rowType = 'pending';
  if (!row.isValid) rowType = 'invalid';
  else if (row.generatedRecord?.type === 'EXPENSE') rowType = 'valid_expense';
  else if (row.generatedRecord?.type === 'SETTLEMENT') rowType = 'valid_settlement';
  else if (hasAnomalies) rowType = 'anomaly';

  const cfg = rowStatusConfig[rowType];

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center">
        <EventDot type={rowType} />
        {!isLast && <div className="w-px flex-1 bg-slate-800 mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-6 flex-1 min-w-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left group"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-300">Row #{row.rowNumber}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide border"
              style={{
                background: `${cfg.color}18`,
                color: `${cfg.color}`,
                borderColor: `${cfg.color}30`,
              }}
            >
              {cfg.icon} {cfg.label}
            </span>
            {hasAnomalies && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                {row.anomalyHistory.length} anomaly
              </span>
            )}
            <svg
              className={`w-3.5 h-3.5 text-slate-500 ml-auto shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="text-[11px] text-slate-500">
            {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
          </p>
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            {/* Generated Record */}
            {hasRecord && (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Generated Record</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {Object.entries(row.generatedRecord).map(([k, v]) => (
                    v !== null && v !== undefined ? (
                      <div key={k} className="flex gap-1.5">
                        <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-slate-300 font-medium truncate">{String(v)}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* Anomaly History */}
            {hasAnomalies && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500/70 mb-2">Anomaly History</p>
                <div className="space-y-2">
                  {row.anomalyHistory.map((a) => (
                    <div key={a.id} className="text-xs text-slate-400 flex gap-2">
                      <span className="text-amber-400 font-semibold shrink-0">{a.type?.replace(/_/g, ' ')}</span>
                      <span>—</span>
                      <span className="truncate">{a.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolutions */}
            {hasResolutions && (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70 mb-2">Resolutions</p>
                <div className="space-y-2">
                  {row.resolutionHistory.map((r) => (
                    <div key={r.anomalyId} className="text-xs text-slate-400 flex gap-2">
                      <span className={`font-bold shrink-0 ${r.status === 'APPROVED' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {r.status}
                      </span>
                      <span>by {r.resolvedBy?.name || 'Unknown'}</span>
                      {r.resolutionNote && <span className="truncate">— {r.resolutionNote}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Validation errors */}
            {!row.isValid && row.validationErrors && (
              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mb-1">Validation Errors</p>
                <p className="text-xs text-red-400">{JSON.stringify(row.validationErrors)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * AuditTimeline — vertical timeline of import rows with expandable details.
 * Props: rows[] (from auditTrail.rows)
 */
const AuditTimeline = ({ rows = [] }) => {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-200">No rows to display</p>
        <p className="text-xs text-slate-500">This import has no row-level data.</p>
      </div>
    );
  }

  return (
    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {rows.map((row, idx) => (
        <AuditRowItem
          key={row.rowNumber ?? idx}
          row={row}
          isLast={idx === rows.length - 1}
        />
      ))}
    </div>
  );
};

export default AuditTimeline;
