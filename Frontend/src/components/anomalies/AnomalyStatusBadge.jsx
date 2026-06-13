import React from 'react';

const AnomalyStatusBadge = ({ status }) => {
  let badgeClasses = '';
  let statusText = status || 'UNKNOWN';

  switch (status) {
    case 'PENDING':
    case 'UNRESOLVED':
      badgeClasses = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      break;
    case 'APPROVED':
    case 'RESOLVED':
      badgeClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450';
      break;
    case 'REJECTED':
      badgeClasses = 'bg-red-500/10 border-red-500/20 text-red-400';
      break;
    case 'AUTO_FIXED':
    case 'DISMISSED':
      badgeClasses = 'bg-sky-500/10 border-sky-500/20 text-sky-400';
      break;
    default:
      badgeClasses = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }

  return (
    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wider border uppercase w-fit inline-block ${badgeClasses}`}>
      {statusText.replace('_', ' ')}
    </span>
  );
};

export default AnomalyStatusBadge;
