import React from 'react';
import { Link } from 'react-router-dom';

const SettlementCard = ({ settlement }) => {
  const payerName = settlement.payer?.name || `User #${settlement.payerId}`;
  const payeeName = settlement.payee?.name || `User #${settlement.payeeId}`;
  
  const dateFormatted = new Date(settlement.transactionDate).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });

  const formattedAmount = parseFloat(settlement.amount).toFixed(2);
  const formattedNormalized = settlement.normalizedAmount ? parseFloat(settlement.normalizedAmount).toFixed(2) : null;

  return (
    <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 transition-all duration-300 flex flex-col gap-4 shadow-md backdrop-blur-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 w-fit">
              Settlement
            </span>
            {settlement.importId && (
              <span className="text-[10px] font-bold text-violet-400 tracking-wider uppercase px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 w-fit">
                Imported
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className="text-sm font-semibold text-slate-100">{payerName}</span>
            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span className="text-sm font-semibold text-slate-100">{payeeName}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-white block">
            {settlement.currency} {formattedAmount}
          </span>
          {settlement.currency !== 'INR' && formattedNormalized && (
            <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
              ≈ ₹{formattedNormalized} INR
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-450 border-t border-slate-900 pt-4 mt-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-400">Date: <strong className="text-slate-350">{dateFormatted}</strong></span>
          {settlement.currency !== 'INR' && settlement.exchangeRate && (
            <span className="text-[10px] text-slate-500">Rate: 1 {settlement.currency} = {parseFloat(settlement.exchangeRate).toFixed(4)} INR</span>
          )}
        </div>
        
        <Link
          to={`/settlements/${settlement.id}`}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default SettlementCard;
