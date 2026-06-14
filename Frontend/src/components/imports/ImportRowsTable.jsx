import React from 'react';

const getField = (rowObject, possibleKeys) => {
  if (!rowObject || typeof rowObject !== 'object') return '';
  const keys = Object.keys(rowObject);
  for (const key of keys) {
    const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (possibleKeys.includes(normalizedKey)) {
      return rowObject[key];
    }
  }
  // If no match found, fallback to return the first key value or empty
  return '';
};

const ImportRowsTable = ({ rows = [] }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <th className="px-5 py-4 w-16">Row</th>
            <th className="px-5 py-4 w-24">Status</th>
            <th className="px-5 py-4">Description</th>
            <th className="px-5 py-4">Amount</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Payer</th>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Validation Failures / Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-350 font-medium">
          {rows.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-5 py-8 text-center text-slate-500">
                No rows found in this import.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              let raw = {};
              try {
                if (typeof row.rawContent === 'string') {
                  raw = JSON.parse(row.rawContent);
                } else if (row.rawContent && typeof row.rawContent === 'object') {
                  raw = row.rawContent;
                }
              } catch (e) {
                console.error("Failed to parse row.rawContent JSON string", e);
              }
              const desc = getField(raw, ['description', 'desc', 'title', 'item']);
              const amount = getField(raw, ['amount', 'sum', 'total', 'cost']);
              const category = getField(raw, ['category', 'cat', 'type']);
              const payer = getField(raw, ['payer', 'paidby', 'paidbyid', 'paid_by']);
              const date = getField(raw, ['date', 'transactiondate', 'transaction_date', 'time']);

              // Format date nicely if valid timestamp
              let formattedDate = date;
              if (date && !isNaN(Date.parse(date))) {
                formattedDate = new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' });
              }

              return (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-900/5 transition-colors ${
                    !row.isValid ? 'bg-red-950/5 hover:bg-red-950/10' : ''
                  }`}
                >
                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                    {row.rowNumber}
                  </td>
                  <td className="px-5 py-4">
                    {row.isValid ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-wider">
                        Valid
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 uppercase tracking-wider">
                        Invalid
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-200">
                    {desc || <span className="text-slate-650 italic">Empty</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-100">
                    {amount ? parseFloat(amount).toFixed(2) : <span className="text-slate-650 italic">N/A</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {category ? (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {category}
                      </span>
                    ) : (
                      <span className="text-slate-650 italic">None</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {payer || <span className="text-slate-650 italic">Unknown</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-450">
                    {formattedDate || <span className="text-slate-650 italic">N/A</span>}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    {!row.isValid ? (
                      <span className="text-red-400/90 font-medium block max-w-xs leading-relaxed">
                        ⚠️ {row.validationErrors}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic text-[11px]">Ready for ledger</span>
                    )}
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

export default ImportRowsTable;
