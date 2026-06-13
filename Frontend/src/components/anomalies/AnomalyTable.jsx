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

const AnomalyTable = ({ anomalies }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-950/40">
            <th className="py-4.5 px-6">Row</th>
            <th className="py-4.5 px-6">Anomaly Type</th>
            <th className="py-4.5 px-6">Severity</th>
            <th className="py-4.5 px-6">Status</th>
            <th className="py-4.5 px-6">Description</th>
            <th className="py-4.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-350 text-xs">
          {anomalies.map((anomaly) => {
            const rowNum = anomaly.importRow?.rowNumber || anomaly.rowNumber || 'N/A';
            return (
              <tr key={anomaly.id} className="hover:bg-slate-900/10 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-400">#{rowNum}</td>
                <td className="py-4 px-6 font-bold text-slate-200">
                  {formatTypeName(anomaly.type)}
                </td>
                <td className="py-4 px-6">
                  <SeverityBadge severity={anomaly.severity} />
                </td>
                <td className="py-4 px-6">
                  <AnomalyStatusBadge status={anomaly.status} />
                </td>
                <td className="py-4 px-6 max-w-sm truncate text-slate-400" title={anomaly.description}>
                  {anomaly.description}
                </td>
                <td className="py-4 px-6 text-right">
                  <Link
                    to={`/anomalies/${anomaly.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Review
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AnomalyTable;
