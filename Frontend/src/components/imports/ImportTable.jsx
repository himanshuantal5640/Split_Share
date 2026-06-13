import React from 'react';
import { Link } from 'react-router-dom';
import ImportStatusBadge from './ImportStatusBadge';

const ImportTable = ({ imports = [] }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    }) + ' ' + new Date(dateString).toLocaleTimeString(undefined, {
      timeStyle: 'short',
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <th className="px-6 py-4">Job ID</th>
            <th className="px-6 py-4">Filename</th>
            <th className="px-6 py-4">Group Circle</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Row Statistics (Total / Valid / Failed)</th>
            <th className="px-6 py-4">Upload Timestamp</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
          {imports.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                No CSV import logs found.
              </td>
            </tr>
          ) : (
            imports.map((item) => {
              const groupName = item.group?.name || `Group #${item.groupId}`;

              return (
                <tr key={item.id} className="hover:bg-slate-900/10 transition-colors">
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                    #{item.id}
                  </td>
                  <td className="px-6 py-4 text-slate-100 font-semibold">
                    {item.originalFilename}
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {groupName}
                  </td>
                  <td className="px-6 py-4">
                    <ImportStatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-slate-200 font-bold">{item.totalRows}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-emerald-400 font-semibold">{item.importedRowsCount}</span>
                      <span className="text-slate-600">/</span>
                      <span className="text-red-400 font-semibold">{item.failedRowsCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-450">{formatDate(item.createdAt)}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/imports/${item.id}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 hover:border-slate-700 text-indigo-400 hover:bg-slate-900/40 transition-all cursor-pointer inline-block"
                    >
                      Details
                    </Link>
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

export default ImportTable;
