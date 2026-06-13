import React from 'react';

const ResolutionSummaryCard = ({ total, approved, rejected, pending }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Total Anomalies */}
      <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Total Anomalies
        </span>
        <span className="text-3xl font-black text-slate-100 mt-1">
          {total}
        </span>
        <span className="text-[10px] text-slate-500">Total flags identified by detectors</span>
      </div>

      {/* Approved / Overridden */}
      <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-2">
        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
          Approved (Overridden)
        </span>
        <span className="text-3xl font-black text-emerald-450 mt-1">
          {approved}
        </span>
        <span className="text-[10px] text-slate-500">Allowed to proceed into ledger</span>
      </div>

      {/* Rejected / Dismissed */}
      <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-2">
        <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
          Rejected (Dismissed)
        </span>
        <span className="text-3xl font-black text-red-400 mt-1">
          {rejected}
        </span>
        <span className="text-[10px] text-slate-500">Skipped from ledger generation</span>
      </div>

      {/* Pending Action */}
      <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-2">
        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
          Pending Review
        </span>
        <span className="text-3xl font-black text-amber-400 mt-1">
          {pending}
        </span>
        <span className="text-[10px] text-slate-500">Requires auditor review action</span>
      </div>
    </div>
  );
};

export default ResolutionSummaryCard;
