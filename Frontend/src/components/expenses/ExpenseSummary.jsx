import React from 'react';

const ExpenseSummary = ({ expense }) => {
  if (!expense) return null;

  const dateFormatted = new Date(expense.transactionDate).toLocaleDateString(undefined, {
    dateStyle: 'full',
  });

  const payerName = expense.paidBy?.name || `User #${expense.paidById}`;
  const payerEmail = expense.paidBy?.email || '';

  return (
    <div className="flex flex-col gap-6">
      {/* Meta Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* original & converted currency stats */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur flex flex-col gap-3">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Transaction Amount</span>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {expense.currency} {parseFloat(expense.amount).toFixed(2)}
            </span>
            {expense.currency !== 'INR' && expense.normalizedAmount && (
              <span className="text-sm font-semibold text-emerald-400 mt-1">
                ≈ ₹{parseFloat(expense.normalizedAmount).toFixed(2)} INR
              </span>
            )}
          </div>
        </div>

        {/* conversion logs */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur flex flex-col gap-3">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Exchange Rate Metrics</span>
          <div className="flex flex-col gap-0.5">
            {expense.currency === 'INR' ? (
              <span className="text-sm font-semibold text-slate-300">Base Currency (No conversion required)</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-slate-350">
                  1 {expense.currency} = {parseFloat(expense.exchangeRate || 1).toFixed(4)} INR
                </span>
                <span className="text-xs text-slate-550 mt-1">
                  Historical rate applied on transaction date.
                </span>
              </>
            )}
          </div>
        </div>

        {/* payer tags */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur flex flex-col gap-3">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Paid By</span>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-200">{payerName}</span>
            {payerEmail && <span className="text-xs text-slate-500">{payerEmail}</span>}
          </div>
        </div>
      </div>

      {/* Split Details Breakdown */}
      <div className="flex flex-col gap-4">
        <h4 className="text-lg font-bold text-slate-100 uppercase tracking-wide text-xs">Participant Splits Breakdown</h4>

        <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Split Share details</th>
                <th className="px-6 py-4 text-right">Computed Share ({expense.currency})</th>
                {expense.currency !== 'INR' && <th className="px-6 py-4 text-right">Normalized Share (INR)</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
              {expense.splits?.map((split) => {
                const pName = split.user?.name || `User #${split.userId}`;
                const pEmail = split.user?.email || '';

                // Calculate display share values
                let allocationDetails = 'Equal Split';
                if (expense.splitType === 'PERCENTAGE' && split.percentage) {
                  allocationDetails = `${parseFloat(split.percentage).toFixed(1)}% Share`;
                } else if (expense.splitType === 'UNEQUAL' && split.share) {
                  allocationDetails = `Manual Share`;
                }

                // Compute split amounts
                const computedAmt = parseFloat(split.amount) || 0;
                // If the expense is original currency USD and we converted to INR, the split amount returned is already in INR (the base normalization currency)
                // Wait, let's verify if the split.amount returned by backend is in original currency or INR!
                // Let's check: in backend calculatesplits returns splits in original amount, then expense.service multiplies by exchange rate to get normalized splits.
                // Let's verify what splits table stores. Splits table stores splits in original amount, or normalized?
                // Wait! Let's check Prisma schema for ExpenseSplit model or check how splits are mapped.
                // Let's look at `prisma/schema.prisma` table definitions for `ExpenseSplit`.
                return (
                  <tr key={split.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-200">{pName}</span>
                        {pEmail && <span className="text-xs text-slate-500">{pEmail}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs font-semibold uppercase">{allocationDetails}</td>
                    <td className="px-6 py-4 text-right text-slate-100 font-bold">
                      {expense.currency} {computedAmt.toFixed(2)}
                    </td>
                    {expense.currency !== 'INR' && expense.normalizedAmount && (
                      <td className="px-6 py-4 text-right text-emerald-400">
                        ₹{(computedAmt * parseFloat(expense.exchangeRate || 1)).toFixed(2)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;

