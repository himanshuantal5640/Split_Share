import React from 'react';

const EqualSplitForm = ({ amount, currency, selectedParticipants = [] }) => {
  const count = selectedParticipants.length;
  const rawShare = count > 0 ? parseFloat(amount) / count : 0;
  const share = isNaN(rawShare) ? '0.00' : rawShare.toFixed(2);

  return (
    <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/20 flex flex-col gap-2">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Split Distribution Summary</span>
        <span className="text-indigo-400 font-bold text-xs">{count} Splits</span>
      </div>
      <div className="text-sm text-slate-300 leading-relaxed mt-1">
        {count === 0 ? (
          <span className="text-slate-500 italic">Please select at least one participant to distribute.</span>
        ) : (
          <span>
            Each participant will owe <span className="text-white font-bold">{currency} {share}</span>.
          </span>
        )}
      </div>
    </div>
  );
};

export default EqualSplitForm;
