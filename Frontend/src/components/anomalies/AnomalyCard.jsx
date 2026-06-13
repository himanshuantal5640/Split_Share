import React from 'react';
import { Link } from 'react-router-dom';
import SeverityBadge from './SeverityBadge';
import AnomalyStatusBadge from './AnomalyStatusBadge';

const formatTypeName = (type) => {
  if (!type) return '';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const AnomalyCard = ({ anomaly }) => {
  const rowNum = anomaly.importRow?.rowNumber || anomaly.rowNumber;

  return (
    <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col justify-between gap-4 hover:border-slate-800 transition-colors">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-sm font-bold text-slate-200 tracking-wide">
            {formatTypeName(anomaly.type)}
          </h4>
          <SeverityBadge severity={anomaly.severity} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          {rowNum && (
            <>
              <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wider">
                Row #{rowNum}
              </span>
              <span className="text-slate-800">•</span>
            </>
          )}
          <AnomalyStatusBadge status={anomaly.status} />
        </div>
        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          {anomaly.description}
        </p>
      </div>

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-900/60">
        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
          {anomaly.group?.name || `Group ID #${anomaly.groupId}`}
        </span>
        <Link
          to={`/anomalies/${anomaly.id}`}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
        >
          Review & Resolve
        </Link>
      </div>
    </div>
  );
};

export default AnomalyCard;
