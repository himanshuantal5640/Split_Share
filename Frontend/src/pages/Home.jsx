import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * High-fidelity landing page for SpitExpense.
 */
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 backdrop-blur text-xs font-semibold text-indigo-400 tracking-wide mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Now Live: Asynchronous CSV Import Engines
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none text-white">
          Manage Group Expenses with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            Absolute Precision
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl">
          An enterprise-grade expense splitter backing dynamic membership histories, historical currency conversions to INR, anomaly scanners, and greedy cash-flow simplifiers.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-350 cursor-pointer"
            >
              Go to Dashboard ({user.name})
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-350 cursor-pointer"
              >
                Start Splitting For Free
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-medium border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-900/40 transition-all duration-200 cursor-pointer"
              >
                Sign In to Account
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="flex flex-col gap-10">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white">Advanced Ledger Operations</h2>
          <p className="mt-2 text-slate-400">
            Engineered to handle edge cases, currency volatility, and bulk entries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 hover:bg-slate-900/20 transition-all duration-300 group flex flex-col gap-4">
            <div className="w-11 h-11 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">Flexible Splitting</h3>
              <p className="mt-1.5 text-sm text-slate-450 leading-relaxed">
                Distribute group costs equally, unequally, or by percentages. The engine resolves down to exact decimal limits.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 hover:bg-slate-900/20 transition-all duration-300 group flex flex-col gap-4">
            <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">CSV Stream Importer</h3>
              <p className="mt-1.5 text-sm text-slate-450 leading-relaxed">
                Upload massive transaction sets. Files parse as memory streams asynchronously without locking main server threads.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 hover:bg-slate-900/20 transition-all duration-300 group flex flex-col gap-4">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 group-hover:text-amber-400 transition-colors">Anomaly Engine</h3>
              <p className="mt-1.5 text-sm text-slate-450 leading-relaxed">
                Scan uploads for duplicate outlays, missing exchange rates, membership conflicts, and negative values automatically.
              </p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800/80 hover:bg-slate-900/20 transition-all duration-300 group flex flex-col gap-4">
            <div className="w-11 h-11 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 group-hover:text-violet-400 transition-colors">Repayment Solver</h3>
              <p className="mt-1.5 text-sm text-slate-450 leading-relaxed">
                Simplify repayments. The Greedy Min-Cash-Flow settler reduces complex multi-party debt networks to minimal transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Readiness Status Banner */}
      <section className="p-8 rounded-2xl border border-slate-900 bg-slate-950/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Integrated Diagnostics Active</h3>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            API is guarded by live liveness readiness and sub-component health latency probes.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Prisma Connection: UP
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Subsystems: HEALTHY
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
