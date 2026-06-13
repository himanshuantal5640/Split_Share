import React from 'react';

/**
 * StatsCard — A single metric stat tile used in the Reports dashboard.
 * Props: icon, label, value, subValue, gradient, trend
 */
const StatsCard = ({ icon, label, value, subValue, gradient = 'from-indigo-500 to-violet-600', trend }) => {
  const trendPositive = trend > 0;
  const trendNeutral = trend === undefined || trend === null;

  return (
    <div className="relative group rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-5 hover:border-slate-700 transition-all duration-300 hover:shadow-xl hover:shadow-slate-900/40 overflow-hidden">
      {/* Glow */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Icon + Label */}
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-20 flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</span>
        </div>

        {/* Value */}
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl font-bold text-slate-100 leading-none">{value}</span>

          {!trendNeutral && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${trendPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {trendPositive ? '▲' : '▼'} {Math.abs(trend)}
            </span>
          )}
        </div>

        {/* Sub value */}
        {subValue && (
          <span className="text-[11px] text-slate-500 leading-relaxed">{subValue}</span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
