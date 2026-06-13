import React from 'react';

/**
 * Displays a summary balance card (owes / owed / net).
 * Props:
 *  - label: string
 *  - amount: number
 *  - currency: string
 *  - variant: 'owe' | 'owed' | 'net' | 'neutral'
 *  - icon: ReactNode (optional)
 */
const BalanceCard = ({ label, amount, currency = 'USD', variant = 'neutral', icon }) => {
  const isNegative = parseFloat(amount) < 0;
  const absAmount = Math.abs(parseFloat(amount) || 0);

  const variants = {
    owe: {
      container: 'border-red-500/20 bg-gradient-to-br from-red-950/30 to-slate-950',
      badge: 'bg-red-500/10 text-red-400 border-red-500/20',
      amount: 'text-red-400',
      glow: 'from-red-500/10 to-transparent',
    },
    owed: {
      container: 'border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-slate-950',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      amount: 'text-emerald-400',
      glow: 'from-emerald-500/10 to-transparent',
    },
    net: {
      container: isNegative
        ? 'border-red-500/20 bg-gradient-to-br from-red-950/30 to-slate-950'
        : 'border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-slate-950',
      badge: isNegative
        ? 'bg-red-500/10 text-red-400 border-red-500/20'
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      amount: isNegative ? 'text-red-400' : 'text-emerald-400',
      glow: isNegative ? 'from-red-500/10 to-transparent' : 'from-emerald-500/10 to-transparent',
    },
    neutral: {
      container: 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      amount: 'text-white',
      glow: 'from-indigo-500/10 to-transparent',
    },
  };

  const v = variants[variant] || variants.neutral;

  const formatAmount = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className={`relative rounded-2xl border p-5 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-xl ${v.container}`}>
      {/* Glow overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${v.glow} opacity-60 pointer-events-none`} />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${v.badge} uppercase tracking-wider`}>
            {label}
          </span>
          {icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${v.badge} border`}>
              {icon}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${v.amount}`}>
          {variant === 'net' && isNegative ? '- ' : ''}{formatAmount(absAmount)}
        </div>

        {/* Currency tag */}
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
          <span className="text-xs text-slate-500 font-medium">{currency}</span>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
