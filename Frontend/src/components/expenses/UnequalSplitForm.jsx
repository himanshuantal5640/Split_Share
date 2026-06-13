import React from 'react';

const UnequalSplitForm = ({ amount, currency, selectedParticipants = [], shares = {}, onChange }) => {
  const totalAmount = parseFloat(amount) || 0;

  const handleShareChange = (userId, value) => {
    const parsed = parseFloat(value);
    onChange({
      ...shares,
      [userId]: isNaN(parsed) ? '' : parsed,
    });
  };

  const sumShares = Object.entries(shares)
    .filter(([userId]) => selectedParticipants.some((p) => p.userId === parseInt(userId, 10)))
    .reduce((acc, [_, sh]) => acc + (parseFloat(sh) || 0), 0);

  const remaining = totalAmount - sumShares;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl border border-slate-900 bg-slate-950/20">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span>Specify Manual Shares ({currency})</span>
        <span className={remaining === 0 ? 'text-emerald-400 font-bold' : 'text-amber-500 font-bold'}>
          {remaining === 0
            ? 'Fully Distributed'
            : `Remaining: ${currency} ${remaining.toFixed(2)}`}
        </span>
      </div>

      {selectedParticipants.length === 0 ? (
        <div className="text-sm text-slate-500 italic py-2">
          Please select at least one participant to define shares.
        </div>
      ) : (
        <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto pr-1">
          {selectedParticipants.map((p) => (
            <div key={p.userId} className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-slate-300 truncate max-w-[180px]">
                {p.name}
              </span>
              <div className="relative rounded-lg bg-slate-950 border border-slate-800 focus-within:border-indigo-500 transition-colors w-32 shrink-0">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shares[p.userId] ?? ''}
                  onChange={(e) => handleShareChange(p.userId, e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-right text-sm text-slate-100 placeholder-slate-700 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedParticipants.length > 0 && (
        <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-xs font-bold">
          <span className="text-slate-450">TOTAL SUM ENTERED</span>
          <span className={Math.abs(remaining) < 0.01 ? 'text-emerald-400' : 'text-red-400'}>
            {currency} {sumShares.toFixed(2)} / {totalAmount.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default UnequalSplitForm;
