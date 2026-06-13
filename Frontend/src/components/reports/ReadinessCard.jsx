import React from 'react';
import HealthStatusBadge from './HealthStatusBadge';

/**
 * ReadinessCard — shows a system readiness check result.
 * Props: title, status, details (object of key-value pairs), icon
 */
const ReadinessCard = ({ title, status, details, icon }) => {
  const isHealthy = ['UP', 'HEALTHY', 'COMPLETE', 'WRITABLE'].includes(status);
  const isDegraded = ['DEGRADED', 'INCOMPLETE'].includes(status);

  const borderClass = isHealthy
    ? 'border-emerald-500/20 hover:border-emerald-500/40'
    : isDegraded
    ? 'border-amber-500/20 hover:border-amber-500/40'
    : 'border-red-500/20 hover:border-red-500/40';

  const glowClass = isHealthy
    ? 'from-emerald-500 to-teal-500'
    : isDegraded
    ? 'from-amber-500 to-orange-500'
    : 'from-red-500 to-rose-500';

  return (
    <div className={`relative group rounded-2xl border bg-slate-900/60 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/40 overflow-hidden ${borderClass}`}>
      {/* Glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${glowClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${glowClass} bg-opacity-20 flex items-center justify-center text-lg`}>
              {icon}
            </div>
            <span className="text-sm font-semibold text-slate-200">{title}</span>
          </div>
          <HealthStatusBadge status={status} />
        </div>

        {/* Details */}
        {details && Object.keys(details).length > 0 && (
          <div className="space-y-1.5">
            {Object.entries(details).map(([key, val]) => (
              val !== null && val !== undefined && (
                <div key={key} className="flex justify-between gap-3 text-xs">
                  <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                  <span className="text-slate-300 font-medium text-right truncate max-w-[60%]" title={String(val)}>
                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                  </span>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadinessCard;
