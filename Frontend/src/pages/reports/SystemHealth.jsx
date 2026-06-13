import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ReadinessCard from '../../components/reports/ReadinessCard';
import HealthStatusBadge from '../../components/reports/HealthStatusBadge';
import { useReports } from '../../hooks/useReports';

const SkeletonGrid = ({ n = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
    {Array.from({ length: n }).map((_, i) => (
      <div key={i} className="h-36 rounded-2xl bg-slate-900" />
    ))}
  </div>
);

const SystemHealth = () => {
  const { readiness, health, loading, error, fetchReadiness, fetchHealth } = useReports();

  useEffect(() => {
    fetchReadiness().catch(console.error);
    fetchHealth().catch(console.error);
  }, [fetchReadiness, fetchHealth]);

  const handleRefresh = () => {
    fetchReadiness().catch(console.error);
    fetchHealth().catch(console.error);
  };

  // Build readiness cards
  const readinessCards = readiness
    ? [
        {
          title: 'Database',
          status: readiness.checks?.database?.status ?? 'UNKNOWN',
          details: { error: readiness.checks?.database?.error },
          icon: '🗄️',
        },
        {
          title: 'Environment Variables',
          status: readiness.checks?.environment?.status ?? 'UNKNOWN',
          details: {
            missing: readiness.checks?.environment?.missing?.join(', ') || 'None',
          },
          icon: '⚙️',
        },
        {
          title: 'Uploads Folder',
          status: readiness.checks?.uploadsFolder?.status ?? 'UNKNOWN',
          details: {
            path: readiness.checks?.uploadsFolder?.path,
            error: readiness.checks?.uploadsFolder?.error,
          },
          icon: '📁',
        },
      ]
    : [];

  // Build health cards
  const healthCards = health
    ? [
        {
          title: 'Database',
          status: health.status?.database?.status ?? 'UNKNOWN',
          details: {
            latency: health.status?.database?.latencyMs != null ? `${health.status.database.latencyMs}ms` : null,
          },
          icon: '🗄️',
        },
        {
          title: 'Import Engine',
          status: health.status?.importEngine?.status ?? 'UNKNOWN',
          details: {
            'total jobs': health.status?.importEngine?.totalJobsCount,
            'stuck jobs': health.status?.importEngine?.stuckJobsCount,
          },
          icon: '📤',
        },
        {
          title: 'Balance Engine',
          status: health.status?.balanceEngine?.status ?? 'UNKNOWN',
          details: {
            'active memberships': health.status?.balanceEngine?.activeMembershipsCount,
          },
          icon: '⚖️',
        },
        {
          title: 'Currency Engine',
          status: health.status?.currencyEngine?.status ?? 'UNKNOWN',
          details: {
            'exchange rates': health.status?.currencyEngine?.exchangeRatesCount,
          },
          icon: '💱',
        },
      ]
    : [];

  const overallReady = readiness?.ready;
  const overallHealthy = health?.healthy;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="System Health"
        subtitle="Real-time diagnostics for all system components and infrastructure readiness."
        actions={
          <div className="flex gap-2.5">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700 text-slate-300 hover:border-slate-600 hover:text-slate-100 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link
              to="/reports"
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all duration-200"
            >
              ← Reports
            </Link>
          </div>
        }
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Overall Status Banner */}
      {(readiness || health) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Readiness */}
          {readiness && (
            <div className={`flex items-center gap-4 p-5 rounded-2xl border backdrop-blur-sm transition-all ${overallReady ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-red-500/20 bg-red-950/10'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${overallReady ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {overallReady ? '✅' : '🔴'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-100">System Readiness</span>
                  <HealthStatusBadge status={overallReady ? 'READY' : 'NOT_READY'} size="sm" />
                </div>
                <p className="text-xs text-slate-500">
                  {readiness.timestamp ? `Last checked: ${new Date(readiness.timestamp).toLocaleTimeString()}` : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Health */}
          {health && (
            <div className={`flex items-center gap-4 p-5 rounded-2xl border backdrop-blur-sm transition-all ${overallHealthy ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-amber-500/20 bg-amber-950/10'}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${overallHealthy ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                {overallHealthy ? '💚' : '⚠️'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-100">Component Health</span>
                  <HealthStatusBadge status={overallHealthy ? 'HEALTHY' : 'DEGRADED'} size="sm" />
                </div>
                <p className="text-xs text-slate-500">
                  {health.timestamp ? `Last checked: ${new Date(health.timestamp).toLocaleTimeString()}` : '—'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Readiness Checks */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Readiness Checks</h2>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        {loading && !readiness ? (
          <SkeletonGrid n={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {readinessCards.map((card) => (
              <ReadinessCard key={card.title} {...card} />
            ))}
          </div>
        )}
      </section>

      {/* Component Health */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Component Health</h2>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        {loading && !health ? (
          <SkeletonGrid n={4} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthCards.map((card) => (
              <ReadinessCard key={card.title} {...card} />
            ))}
          </div>
        )}
      </section>

      {/* JWT + Uploads note */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Security & Storage</h2>
          <div className="flex-1 h-px bg-slate-800" />
        </div>
        {readiness && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JWT status derived from environment check */}
            <ReadinessCard
              title="JWT Secret"
              status={
                readiness.checks?.environment?.missing?.includes('JWT_SECRET')
                  ? 'INCOMPLETE'
                  : 'COMPLETE'
              }
              details={{
                'env var': 'JWT_SECRET',
                configured: !readiness.checks?.environment?.missing?.includes('JWT_SECRET'),
              }}
              icon="🔑"
            />
            {/* Uploads Folder */}
            <ReadinessCard
              title="File Uploads"
              status={readiness.checks?.uploadsFolder?.status ?? 'UNKNOWN'}
              details={{
                path: readiness.checks?.uploadsFolder?.path,
              }}
              icon="📁"
            />
          </div>
        )}
      </section>
    </div>
  );
};

export default SystemHealth;
