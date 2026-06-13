import React from 'react';

const SeverityBadge = ({ severity }) => {
  let badgeClasses = '';
  const severityText = severity || 'LOW';

  switch (severity) {
    case 'LOW':
      badgeClasses = 'bg-slate-500/10 border-slate-550/20 text-slate-400';
      break;
    case 'MEDIUM':
      badgeClasses = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      break;
    case 'HIGH':
      badgeClasses = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      break;
    case 'CRITICAL':
      badgeClasses = 'bg-red-500/15 border-red-500/30 text-red-400 animate-pulse font-extrabold';
      break;
    default:
      badgeClasses = 'bg-slate-500/10 border-slate-500/20 text-slate-400';
  }

  return (
    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wider border uppercase w-fit inline-block ${badgeClasses}`}>
      {severityText}
    </span>
  );
};

export default SeverityBadge;
