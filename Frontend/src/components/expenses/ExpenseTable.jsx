import React from 'react';
import { Link } from 'react-router-dom';

const ExpenseTable = ({ expenses = [], onEditClick, onDeleteClick, currentUserId }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <th className="px-6 py-4">Title / Description</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Payer</th>
            <th className="px-6 py-4">Split Strategy</th>
            <th className="px-6 py-4">Transaction Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
          {expenses.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                No recorded transactions found.
              </td>
            </tr>
          ) : (
            expenses.map((expense) => {
              const payerName = expense.paidBy?.name || `User #${expense.paidById}`;
              const isPayerSelf = expense.paidById === currentUserId;

              return (
                <tr key={expense.id} className="hover:bg-slate-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-slate-100 block">{expense.description}</span>
                    {expense.importId && (
                      <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/5 border border-emerald-500/10 px-1 rounded w-fit block mt-1">
                        CSV Imported
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-200 block">
                      {expense.currency} {parseFloat(expense.amount).toFixed(2)}
                    </span>
                    {expense.currency !== 'INR' && expense.normalizedAmount && (
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        ≈ ₹{parseFloat(expense.normalizedAmount).toFixed(2)} INR
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {payerName} {isPayerSelf && <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1 py-0.2 rounded ml-1">You</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs">
                    <span className="font-semibold">{expense.splitType}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-450">{formatDate(expense.transactionDate)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2.5">
                      <Link
                        to={`/expenses/${expense.id}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 hover:border-slate-700 text-indigo-400 hover:bg-slate-900/40 transition-all cursor-pointer"
                      >
                        Details
                      </Link>
                      <Link
                        to={`/expenses/${expense.id}/edit`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-350 hover:bg-slate-900/40 transition-all cursor-pointer"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDeleteClick(expense.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 hover:border-red-500/35 text-slate-450 hover:text-red-400 hover:bg-red-950/10 transition-all cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
