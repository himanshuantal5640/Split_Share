import React from 'react';

const statusConfig = {
  // Readiness statuses
  UP: { label: 'UP', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  DOWN: { label: 'DOWN', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  WRITABLE: { label: 'WRITABLE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  FAILED: { label: 'FAILED', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
  COMPLETE: { label: 'COMPLETE', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  INCOMPLETE: { label: 'INCOMPLETE', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  // Health statuses
  HEALTHY: { label: 'HEALTHY', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  DEGRADED: { label: 'DEGRADED', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
  UNKNOWN: { label: 'UNKNOWN', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  // Boolean-style
  READY: { label: 'READY', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  NOT_READY: { label: 'NOT READY', color: 'bg-red-500/10 text-red-400 border-red-500/20', dot: 'bg-red-400' },
};

/**
 * HealthStatusBadge — colored pill with animated dot for system health states.
 * Props: status (string), size ('sm' | 'md')
 */
const HealthStatusBadge = ({ status, size = 'sm' }) => {
  const cfg = statusConfig[status] || {
    label: status || 'UNKNOWN',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
  };

  const isHealthy = ['UP', 'HEALTHY', 'WRITABLE', 'COMPLETE', 'READY'].includes(status);
  const textSize = size === 'md' ? 'text-xs' : 'text-[10px]';
  const px = size === 'md' ? 'px-3 py-1' : 'px-2 py-0.5';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wide rounded-full border ${cfg.color} ${textSize} ${px}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${isHealthy ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  );
};

export default HealthStatusBadge;
