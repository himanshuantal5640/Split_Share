import React from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';

const ComingSoon = () => {
  const location = useLocation();

  // Deduce title based on path
  const pathName = location.pathname.substring(1);
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        subtitle={`Ledger module mapping for client view: /${pathName}`}
      />

      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-xl gap-4">
        <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-bold animate-pulse">
          ⚙️
        </div>
        <h2 className="text-xl font-bold text-slate-100">
          Module Under Active Construction
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-md">
          The {title} interface is scheduled to be connected to the API in subsequent frontend development phases. All underlying backend services are fully functional.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
