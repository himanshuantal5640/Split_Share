import React from 'react';
import { Link } from 'react-router-dom';

const ExpenseCard = ({ expense }) => {
  const payerName = expense.paidBy?.name || `User #${expense.paidById}`;
  const dateFormatted = new Date(expense.transactionDate).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });

  return (
    <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 transition-all duration-300 flex flex-col gap-4 shadow-md">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 w-fit">
            {expense.category}
          </span>
          <h4 className="font-bold text-slate-100 text-base line-clamp-1 mt-1">
            {expense.description}
          </h4>
        </div>
        <div className="text-right">
          <span className="text-lg font-black text-white block">
            {expense.currency} {parseFloat(expense.amount).toFixed(2)}
          </span>
          {expense.currency !== 'INR' && expense.normalizedAmount && (
            <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
              ≈ ₹{parseFloat(expense.normalizedAmount).toFixed(2)} INR
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-450 border-t border-slate-900 pt-4 mt-2">
        <div className="flex flex-col gap-0.5">
          <span>Paid by <strong className="text-slate-350">{payerName}</strong></span>
          <span>Date: {dateFormatted}</span>
        </div>
        
        <Link
          to={`/expenses/${expense.id}`}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ExpenseCard;
