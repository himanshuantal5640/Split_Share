import React from 'react';

/**
 * BalanceTable - Renders a list of net balance rows between members.
 * Props:
 *  - balances: Array of { fromUser, toUser, amount, currency }
 *  - currentUserId: number (to highlight current user's rows)
 */
const BalanceTable = ({ balances = [], currentUserId }) => {
  if (balances.length === 0) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-3">
        <span className="text-3xl">⚖️</span>
        <h3 className="text-base font-bold text-slate-200">All Settled Up</h3>
        <p className="text-xs text-slate-400 max-w-xs">No outstanding balances in this group. Everyone is even!</p>
      </div>
    );
  }

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(parseFloat(amount)));
  };

  const getUserName = (user) => {
    if (!user) return 'Unknown';
    return user.name || user.email || `User #${user.id}`;
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950">
            <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">From</th>
            <th className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">To</th>
            <th className="px-5 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Amount Owed</th>
            <th className="px-5 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Currency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900/60">
          {balances.map((row, idx) => {
            const isCurrentPayer = row.fromUser?.id === currentUserId;
            const isCurrentReceiver = row.toUser?.id === currentUserId;
            const highlight = isCurrentPayer || isCurrentReceiver;

            return (
              <tr
                key={idx}
                className={`transition-colors ${highlight ? 'bg-indigo-950/20' : 'bg-slate-950/40 hover:bg-slate-900/40'}`}
              >
                {/* From */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentPayer ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {getUserName(row.fromUser).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-semibold ${isCurrentPayer ? 'text-red-300' : 'text-slate-200'}`}>
                        {getUserName(row.fromUser)}
                        {isCurrentPayer && <span className="ml-1.5 text-[10px] text-red-400/70 font-normal">(you)</span>}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Arrow */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentReceiver ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                        {getUserName(row.toUser).charAt(0).toUpperCase()}
                      </div>
                      <p className={`font-semibold ${isCurrentReceiver ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {getUserName(row.toUser)}
                        {isCurrentReceiver && <span className="ml-1.5 text-[10px] text-emerald-400/70 font-normal">(you)</span>}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-5 py-4 text-right">
                  <span className="font-bold text-base text-amber-400">
                    {formatAmount(row.amount, row.currency)}
                  </span>
                </td>

                {/* Currency */}
                <td className="px-5 py-4 text-center">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 font-semibold tracking-wider">
                    {row.currency || 'USD'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BalanceTable;
