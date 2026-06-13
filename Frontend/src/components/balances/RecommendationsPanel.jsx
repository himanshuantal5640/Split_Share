import React from 'react';
import { Link } from 'react-router-dom';

/**
 * RecommendationsPanel - Shows smart settlement recommendations for the current user.
 * Props:
 *  - recommendations: Array of { group, payer, receiver, amount, currency, priority }
 *  - loading: boolean
 */
const RecommendationsPanel = ({ recommendations = [], loading = false }) => {
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

  const priorityConfig = {
    high: { label: 'High Priority', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
    medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
    low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700', dot: 'bg-slate-500' },
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-900 rounded-xl" />
        ))}
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="min-h-[160px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-slate-900 bg-slate-950/20 gap-3">
        <span className="text-2xl">✅</span>
        <p className="text-sm font-semibold text-slate-200">No Pending Recommendations</p>
        <p className="text-xs text-slate-400">You're all caught up! No settlement actions needed right now.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {recommendations.map((rec, idx) => {
        const priority = priorityConfig[rec.priority] || priorityConfig.low;

        return (
          <div
            key={idx}
            className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-slate-900 bg-slate-950/40 hover:bg-slate-900/40 transition-colors"
          >
            {/* Index Bubble */}
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0">
              {idx + 1}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-slate-100 truncate">
                  Pay <span className="text-amber-400">{formatAmount(rec.amount, rec.currency)}</span> to{' '}
                  <span className="text-emerald-300">{getUserName(rec.receiver || rec.toUser)}</span>
                </p>
              </div>
              {rec.group && (
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  Group: <span className="text-slate-300">{rec.group.name}</span>
                </p>
              )}
            </div>

            {/* Priority Badge */}
            <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border ${priority.bg} ${priority.color} flex items-center gap-1.5 uppercase tracking-wide`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>

            {/* CTA */}
            {rec.group && (
              <Link
                to={`/settlements/create?groupId=${rec.group.id}`}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-colors"
              >
                Settle
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RecommendationsPanel;
