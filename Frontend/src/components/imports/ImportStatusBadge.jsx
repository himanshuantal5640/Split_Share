import React from 'react';

const ImportStatusBadge = ({ status }) => {
  let badgeClasses = '';
  let statusText = status || 'UNKNOWN';

  switch (status) {
    case 'PROCESSING':
      badgeClasses = 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse';
      break;
    case 'COMPLETED':
      badgeClasses = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      break;
    case 'FAILED':
      badgeClasses = 'bg-red-500/10 border-red-500/20 text-red-400';
      break;
    default:
      badgeClasses = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }

  return (
    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wider border uppercase w-fit ${badgeClasses}`}>
      {statusText}
    </span>
  );
};

export default ImportStatusBadge;
