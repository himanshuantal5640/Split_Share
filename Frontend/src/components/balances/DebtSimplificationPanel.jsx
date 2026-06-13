import React from 'react';
import { Link } from 'react-router-dom';

/**
 * DebtSimplificationPanel - Displays simplified (optimized) debt graph.
 * Props:
 *  - simplifiedDebts: Array of { fromUser, toUser, amount, currency }
 *  - originalCount: number (original transaction count before simplification)
 *  - groupId: number (for settlement link)
 *  - currentUserId: number
 */
const DebtSimplificationPanel = ({
  simplifiedDebts = [],
  originalCount = 0,
  groupId,
  currentUserId,
}) => {
  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(parseFloat(amount) || 0));
  };

  const getUserName = (user) => {
    if (!user) return 'Unknown';
    return user.name || user.email || `User #${user.id}`;
  };

  const reduction = originalCount > 0 ? Math.round(((originalCount - simplifiedDebts.length) / originalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stats Banner */}
      {originalCount > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Debt Simplification</p>
              <p className="text-sm font-bold text-indigo-300">
                {originalCount} → {simplifiedDebts.length} transactions
                {reduction > 0 && <span className="ml-2 text-emerald-400">({reduction}% reduction)</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {simplifiedDebts.length === 0 ? (
        <div className="min-h-[180px] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl">
            🎉
          </div>
          <h3 className="text-base font-bold text-slate-200">No Debts to Simplify</h3>
          <p className="text-xs text-slate-400 max-w-xs">This group has no outstanding debts — everyone is settled up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {simplifiedDebts.map((debt, idx) => {
            const isCurrentPayer = debt.fromUser?.id === currentUserId;
            const isCurrentReceiver = debt.toUser?.id === currentUserId;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 hover:scale-[1.005] ${
                  isCurrentPayer
                    ? 'border-red-500/20 bg-red-950/20 hover:border-red-500/30'
                    : isCurrentReceiver
                    ? 'border-emerald-500/20 bg-emerald-950/20 hover:border-emerald-500/30'
                    : 'border-slate-900 bg-slate-950/40 hover:border-slate-800'
                }`}
              >
                {/* Step Number */}
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
                  {idx + 1}
                </div>

                {/* From User */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentPayer ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {getUserName(debt.fromUser).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${isCurrentPayer ? 'text-red-300' : 'text-slate-200'}`}>
                      {getUserName(debt.fromUser)}
                      {isCurrentPayer && <span className="ml-1 text-[10px] opacity-60">(you)</span>}
                    </p>
                    <p className="text-[10px] text-slate-500">pays</p>
                  </div>
                </div>

                {/* Arrow + Amount */}
                <div className="flex flex-col items-center gap-0.5 px-2">
                  <span className="text-sm font-extrabold text-amber-400">{formatAmount(debt.amount, debt.currency)}</span>
                  <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>

                {/* To User */}
                <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
                  <div className="min-w-0 text-right">
                    <p className={`text-xs font-semibold truncate ${isCurrentReceiver ? 'text-emerald-300' : 'text-slate-200'}`}>
                      {getUserName(debt.toUser)}
                      {isCurrentReceiver && <span className="ml-1 text-[10px] opacity-60">(you)</span>}
                    </p>
                    <p className="text-[10px] text-slate-500">receives</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isCurrentReceiver ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                    {getUserName(debt.toUser).charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA to record settlements */}
      {simplifiedDebts.length > 0 && groupId && (
        <Link
          to={`/settlements/create?groupId=${groupId}`}
          className="self-start mt-1 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/10 flex items-center gap-2 transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Record a Settlement
        </Link>
      )}
    </div>
  );
};

export default DebtSimplificationPanel;
