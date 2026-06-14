import React from 'react';
import { Link } from 'react-router-dom';

const SettlementTable = ({ settlements = [], onDeleteClick, onSettleClick, currentUserId }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <th className="px-6 py-4">Payer</th>
            <th className="px-6 py-4"></th>
            <th className="px-6 py-4">Payee / Receiver</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4">Transaction Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
          {settlements.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                No recorded settlements found.
              </td>
            </tr>
          ) : (
            settlements.map((settlement) => {
              const payerName = settlement.payer?.name || `User #${settlement.payerId}`;
              const payeeName = settlement.payee?.name || `User #${settlement.payeeId}`;
              
              const isPayerSelf = settlement.payerId === currentUserId;
              const isPayeeSelf = settlement.payeeId === currentUserId;

              return (
                <tr key={settlement.id} className="hover:bg-slate-900/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100">{payerName}</span>
                      {isPayerSelf && (
                        <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-center">
                    <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-100">{payeeName}</span>
                      {isPayeeSelf && (
                        <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-200 block">
                      {settlement.currency} {parseFloat(settlement.amount).toFixed(2)}
                    </span>
                    {settlement.currency !== 'INR' && settlement.normalizedAmount && (
                      <span className="text-[10px] text-emerald-400 block mt-0.5">
                        ≈ ₹{parseFloat(settlement.normalizedAmount).toFixed(2)} INR
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-450">{formatDate(settlement.transactionDate)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2.5">
                      {settlement.id >= 1000000 && (
                        <button
                          onClick={() => onSettleClick(settlement)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                        >
                          Settle
                        </button>
                      )}
                      <Link
                        to={`/settlements/${settlement.id}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 hover:border-slate-700 text-indigo-400 hover:bg-slate-900/40 transition-all cursor-pointer"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => onDeleteClick(settlement.id)}
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

export default SettlementTable;
