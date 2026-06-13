import React from 'react';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock dashboard metrics
  const stats = [
    {
      name: 'Total Groups',
      value: '4',
      description: 'Active split circles',
      icon: (
        <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      name: 'Total Expenses',
      value: '₹46,342.50',
      description: 'Normalized INR value',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      name: 'Total Settlements',
      value: '12',
      description: 'Debt balances cleared',
      icon: (
        <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
    {
      name: 'Pending Anomalies',
      value: '2',
      description: 'Requires auditor review',
      icon: (
        <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard Console"
        subtitle={`Welcome back, ${user?.name || 'User'}. Here is your ledger activities snapshot.`}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className={`p-6 rounded-2xl border ${stat.border} ${stat.bg} shadow-md flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-400">
                {stat.name}
              </span>
              <div className="p-2 rounded-lg bg-slate-950/40 border border-slate-900 flex items-center justify-center">
                {stat.icon}
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs text-slate-500">
                {stat.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Info Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Quick Operations Guide */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-100">Overview of Activity</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            The balance calculation engine computes all active group outlays, memberships, and settlements in real-time. Use the left navigation sidebar to manage specific group operations, upload transaction sheets, and run anomaly detections.
          </p>
          <div className="h-[150px] rounded-xl border border-slate-900 bg-slate-950/20 flex items-center justify-center text-xs text-slate-500 font-mono">
            [Chart Simulation Placeholder]
          </div>
        </div>

        {/* System Health */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-100">Engine Diagnostics</h3>
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Greedy Debts Solver</span>
              <span className="text-xs font-semibold text-emerald-400">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">CSV Stream Worker</span>
              <span className="text-xs font-semibold text-emerald-400">HEALTHY</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Prisma Client DB</span>
              <span className="text-xs font-semibold text-emerald-400">CONNECTED</span>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-slate-900">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider block">LAST DIAGNOSTICS</span>
            <span className="text-xs text-slate-400">Passed successfully less than 1m ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
