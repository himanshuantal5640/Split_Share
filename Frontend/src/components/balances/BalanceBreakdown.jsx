import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * BalanceBreakdown - Per-group breakdown of a user's balances.
 * Props:
 *  - breakdown: Array of { group: { id, name }, netBalance, currency, owes, owed }
 */
const BalanceBreakdown = ({ breakdown = [] }) => {
  const [expanded, setExpanded] = useState(null);

  if (breakdown.length === 0) {
    return (
      <div className="min-h-[160px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-slate-900 bg-slate-950/20 gap-3">
        <span className="text-2xl">📊</span>
        <p className="text-sm text-slate-400">No breakdown data available.</p>
      </div>
    );
  }

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(parseFloat(amount) || 0));
  };

  const getNetLabel = (net) => {
    const val = parseFloat(net);
    if (val > 0) return { text: 'You are owed', color: 'text-emerald-400' };
    if (val < 0) return { text: 'You owe', color: 'text-red-400' };
    return { text: 'Settled', color: 'text-slate-400' };
  };

  return (
    <div className="flex flex-col gap-3">
      {breakdown.map((item, idx) => {
        const net = parseFloat(item.netBalance || item.net || 0);
        const { text: netText, color: netColor } = getNetLabel(net);
        const isExpanded = expanded === idx;

        return (
          <div key={idx} className="rounded-2xl border border-slate-900 bg-slate-950/40 overflow-hidden transition-all duration-200">
            {/* Header Row */}
            <button
              onClick={() => setExpanded(isExpanded ? null : idx)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-900/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
                  {item.group?.name?.charAt(0)?.toUpperCase() || 'G'}
                </div>
                <div>
                  <p className="font-semibold text-slate-100 text-sm">{item.group?.name || `Group #${item.group?.id}`}</p>
                  <p className={`text-xs font-medium ${netColor}`}>{netText}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`text-lg font-extrabold ${netColor}`}>
                    {net < 0 ? '- ' : ''}{formatAmount(net, item.currency)}
                  </p>
                  <p className="text-xs text-slate-500">{item.currency || 'USD'}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded Detail */}
            {isExpanded && (
              <div className="px-5 pb-5 pt-1 border-t border-slate-900 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/15">
                    <p className="text-xs text-emerald-400/60 font-medium mb-1">You are Owed</p>
                    <p className="text-base font-bold text-emerald-400">{formatAmount(item.owed || 0, item.currency)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/15">
                    <p className="text-xs text-red-400/60 font-medium mb-1">You Owe</p>
                    <p className="text-base font-bold text-red-400">{formatAmount(item.owes || 0, item.currency)}</p>
                  </div>
                </div>
                <Link
                  to={`/balances?groupId=${item.group?.id}`}
                  className="self-start text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  View Group Balances
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BalanceBreakdown;
