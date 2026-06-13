import React from 'react';

/**
 * BalanceStatusBadge - Renders a colored badge indicating balance status.
 * Props:
 *  - status: 'settled' | 'owes' | 'owed' | 'pending'
 *  - size: 'sm' | 'md' (default: 'sm')
 */
const BalanceStatusBadge = ({ status = 'settled', size = 'sm' }) => {
  const config = {
    settled: {
      label: 'Settled',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-400',
    },
    owes: {
      label: 'Owes',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
      dot: 'bg-red-400',
    },
    owed: {
      label: 'Owed',
      className: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      dot: 'bg-indigo-400',
    },
    pending: {
      label: 'Pending',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      dot: 'bg-amber-400',
    },
  };

  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[10px]';

  const { label, className, dot } = config[status] || config.settled;

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold border rounded-lg uppercase tracking-wider ${sizeClass} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

export default BalanceStatusBadge;
