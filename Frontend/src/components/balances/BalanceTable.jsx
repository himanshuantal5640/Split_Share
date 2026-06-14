import React from 'react';
import BalanceStatusBadge from './BalanceStatusBadge';

/**
 * BalanceTable - Renders a list of net balance rows for each member of the group.
 * Props:
 *  - balances: Array of individual member balances: { userId, name, email, totalPaidExpenses, totalOwedSplits, netBalance }
 *  - currentUserId: number (to highlight current user's row)
 *  - currency: string (default 'INR')
 */
const BalanceTable = ({ balances = [], currentUserId, currency = 'INR' }) => {
  if (balances.length === 0) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-3">
        <span className="text-3xl">⚖️</span>
        <h3 className="text-base font-bold text-slate-200">All Settled Up</h3>
        <p className="text-xs text-slate-400 max-w-xs">No outstanding balances in this group. Everyone is even!</p>
      </div>
    );
  }

  const formatAmount = (amount, curr = 'INR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
    }).format(Math.abs(parseFloat(amount)));
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <th className="px-6 py-4">Member</th>
            <th className="px-6 py-4">Total Paid</th>
            <th className="px-6 py-4">Total Owed</th>
            <th className="px-6 py-4 text-center">Status</th>
            <th className="px-6 py-4 text-right">Net Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
          {balances.map((row, idx) => {
            const isCurrentUser = row.userId === currentUserId;
            const netBalance = parseFloat(row.netBalance || 0);

            let status = 'settled';
            let balanceColor = 'text-slate-400';
            if (netBalance > 0.009) {
              status = 'owed';
              balanceColor = 'text-emerald-400';
            } else if (netBalance < -0.009) {
              status = 'owes';
              balanceColor = 'text-red-400';
            }

            const initial = row.name ? row.name.charAt(0).toUpperCase() : 'U';

            return (
              <tr
                key={row.userId || idx}
                className={`transition-colors ${isCurrentUser ? 'bg-indigo-950/10' : 'hover:bg-slate-900/10'}`}
              >
                {/* Member */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${isCurrentUser ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                      {initial}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                        {row.name || `User #${row.userId}`}
                        {isCurrentUser && (
                          <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 font-normal">{row.email}</p>
                    </div>
                  </div>
                </td>

                {/* Total Paid */}
                <td className="px-6 py-4 text-slate-300 font-medium">
                  {formatAmount(row.totalPaidExpenses || 0, currency)}
                </td>

                {/* Total Owed */}
                <td className="px-6 py-4 text-slate-400">
                  {formatAmount(row.totalOwedSplits || 0, currency)}
                </td>

                {/* Status */}
                <td className="px-6 py-4 text-center">
                  <BalanceStatusBadge status={status} />
                </td>

                {/* Net Balance */}
                <td className={`px-6 py-4 text-right font-extrabold text-base ${balanceColor}`}>
                  {netBalance > 0.009 ? '+' : ''}
                  {formatAmount(netBalance, currency)}
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
