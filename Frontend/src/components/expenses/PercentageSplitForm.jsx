import React from 'react';

const PercentageSplitForm = ({ amount, currency, selectedParticipants = [], percentages = {}, onChange }) => {
  const totalAmount = parseFloat(amount) || 0;

  const handlePercentageChange = (userId, value) => {
    const parsed = parseFloat(value);
    onChange({
      ...percentages,
      [userId]: isNaN(parsed) ? '' : parsed,
    });
  };

  const sumPercentages = Object.entries(percentages)
    .filter(([userId]) => selectedParticipants.some((p) => p.userId === parseInt(userId, 10)))
    .reduce((acc, [_, pct]) => acc + (parseFloat(pct) || 0), 0);

  const remaining = 100 - sumPercentages;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/20">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Specify Percentages (%)</span>
        <span className={remaining === 0 ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
          {remaining === 0
            ? 'Fully Distributed'
            : `Remaining: ${remaining.toFixed(2)}%`}
        </span>
      </div>

      {selectedParticipants.length === 0 ? (
        <div className="text-sm text-slate-500 italic py-2">
          Please select at least one participant to define percentages.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto pr-1">
          {selectedParticipants.map((p) => {
            const pctVal = percentages[p.userId] || 0;
            const computedShare = totalAmount > 0 ? (totalAmount * pctVal) / 100 : 0;

            return (
              <div key={p.userId} className="flex items-center justify-between gap-4">
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold text-slate-300 truncate max-w-[180px]">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-slate-500 leading-normal">
                    Share: {currency} {computedShare.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative rounded-lg bg-slate-950 border border-slate-800 focus-within:border-indigo-500 transition-colors w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={percentages[p.userId] ?? ''}
                      onChange={(e) => handlePercentageChange(p.userId, e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-3 pr-6 py-2 text-right text-sm text-slate-100 placeholder-slate-700 bg-transparent focus:outline-none"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-semibold text-slate-650 pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedParticipants.length > 0 && (
        <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs font-bold">
          <span className="text-slate-450">TOTAL SUM PERCENTAGES</span>
          <span className={Math.abs(remaining) < 0.01 ? 'text-emerald-400' : 'text-red-400'}>
            {sumPercentages.toFixed(2)}% / 100.00%
          </span>
        </div>
      )}
    </div>
  );
};

export default PercentageSplitForm;
