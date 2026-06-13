import React from 'react';
import { Link } from 'react-router-dom';
import ImportStatusBadge from './ImportStatusBadge';

const ImportCard = ({ importItem }) => {
  const dateFormatted = new Date(importItem.createdAt).toLocaleDateString(undefined, {
    dateStyle: 'medium',
  });
  const timeFormatted = new Date(importItem.createdAt).toLocaleTimeString(undefined, {
    timeStyle: 'short',
  });

  return (
    <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 transition-all duration-300 flex flex-col gap-4 shadow-md backdrop-blur-sm">
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5 max-w-[70%]">
          <span className="text-[10px] font-bold text-slate-500 tracking-wider font-mono">
            JOB ID #{importItem.id}
          </span>
          <h4 className="font-bold text-slate-100 text-sm line-clamp-1">
            {importItem.originalFilename}
          </h4>
          <span className="text-xs text-slate-450">
            Circle: <strong className="text-slate-350">{importItem.group?.name || `Group #${importItem.groupId}`}</strong>
          </span>
        </div>
        <ImportStatusBadge status={importItem.status} />
      </div>

      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl border border-slate-900 bg-slate-950/80 text-center text-xs">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total</span>
          <span className="text-slate-200 font-extrabold mt-0.5">{importItem.totalRows}</span>
        </div>
        <div className="flex flex-col border-x border-slate-900">
          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Valid</span>
          <span className="text-emerald-400 font-extrabold mt-0.5">{importItem.importedRowsCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider">Failed</span>
          <span className="text-red-400 font-extrabold mt-0.5">{importItem.failedRowsCount}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-450 border-t border-slate-900 pt-4 mt-1">
        <span>{dateFormatted} at {timeFormatted}</span>
        <Link
          to={`/imports/${importItem.id}`}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ImportCard;
