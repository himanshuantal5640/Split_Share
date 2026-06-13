import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatsCard from '../../components/reports/StatsCard';
import DeliverablesChecklist from '../../components/reports/DeliverablesChecklist';
import { useReports } from '../../hooks/useReports';
import { useImports } from '../../hooks/useImports';

const ErrorAlert = ({ message, onRetry }) => (
  <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm flex items-start gap-2.5">
    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <div>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline">
          Try Again
        </button>
      )}
    </div>
  </div>
);

const SkeletonBlock = ({ h = 'h-24' }) => (
  <div className={`${h} bg-slate-900 rounded-2xl animate-pulse`} />
);

const Reports = () => {
  const { systemStats, loading, error, fetchSystemStats } = useReports();
  const { imports, loading: importsLoading, fetchImports } = useImports();

  useEffect(() => {
    fetchSystemStats().catch(console.error);
    fetchImports().catch(console.error);
  }, [fetchSystemStats, fetchImports]);

  const statCards = systemStats
    ? [
        {
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
          label: 'Total Users',
          value: systemStats.users?.totalCount ?? '—',
          gradient: 'from-indigo-500 to-violet-600',
        },
        {
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
          label: 'Total Groups',
          value: systemStats.groups?.totalCount ?? '—',
          gradient: 'from-violet-500 to-purple-600',
        },
        {
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          label: 'Total Expenses',
          value: systemStats.expenses?.totalCount ?? '—',
          subValue: `₹${(systemStats.expenses?.totalNormalizedAmountINR ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} total value`,
          gradient: 'from-emerald-500 to-teal-600',
        },
        {
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>,
          label: 'Settlements',
          value: systemStats.settlements?.totalCount ?? '—',
          subValue: `₹${(systemStats.settlements?.totalNormalizedAmountINR ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })} total value`,
          gradient: 'from-blue-500 to-indigo-600',
        },
        {
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
          label: 'Total Imports',
          value: systemStats.imports?.total ?? '—',
          subValue: `${systemStats.imports?.breakdown?.COMPLETED ?? 0} completed · ${systemStats.imports?.breakdown?.FAILED ?? 0} failed`,
          gradient: 'from-cyan-500 to-blue-600',
        },
        {
          icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
          label: 'Total Anomalies',
          value: systemStats.anomalies?.total ?? '—',
          subValue: `${systemStats.anomalies?.breakdownByStatus?.APPROVED ?? 0} approved · ${systemStats.anomalies?.breakdownByStatus?.REJECTED ?? 0} rejected`,
          gradient: 'from-amber-500 to-orange-600',
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Reports & Analytics"
        subtitle="System-wide statistics, import reports, audit trails, and final submission deliverables."
        actions={
          <div className="flex gap-2.5">
            <Link
              to="/reports/health"
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-100 transition-all duration-200 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Health
            </Link>
            <Link
              to="/imports"
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              View Imports
            </Link>
          </div>
        }
      />

      {error && <ErrorAlert message={error} onRetry={fetchSystemStats} />}

      {/* System Stats */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">System Statistics</h2>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonBlock key={i} h="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((card) => (
              <StatsCard key={card.label} {...card} />
            ))}
          </div>
        )}
      </section>

      {/* Quick Links: Import Reports */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Import Reports</h2>
          <div className="flex-1 h-px bg-slate-800" />
          <Link to="/imports" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold shrink-0">View all →</Link>
        </div>

        {importsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonBlock key={i} h="h-36" />)}
          </div>
        ) : imports.length === 0 ? (
          <div className="p-8 rounded-2xl border border-slate-800/60 bg-slate-900/40 text-center">
            <p className="text-slate-400 text-sm">No imports found. <Link to="/imports/upload" className="text-indigo-400 hover:underline">Upload a CSV</Link> to generate reports.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {imports.slice(0, 6).map((imp) => (
              <div key={imp.id} className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-5 hover:border-slate-700 transition-all duration-300 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-slate-200 truncate">{imp.originalFilename}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">#{imp.id}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/reports/import/${imp.id}`}
                    className="flex-1 text-center text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all"
                  >
                    📊 Import Report
                  </Link>
                  <Link
                    to={`/reports/audit/${imp.id}`}
                    className="flex-1 text-center text-[10px] font-semibold text-violet-400 hover:text-violet-300 px-2 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 transition-all"
                  >
                    🔍 Audit Trail
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Deliverables */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Final Submission</h2>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        <DeliverablesChecklist />
      </section>
    </div>
  );
};

export default Reports;
