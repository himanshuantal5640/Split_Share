import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import AnomalyTable from '../../components/anomalies/AnomalyTable';
import AnomalyCard from '../../components/anomalies/AnomalyCard';
import { useAnomalies } from '../../hooks/useAnomalies';

const SEVERITIES = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TYPES = [
  'ALL',
  'DUPLICATE_EXPENSE',
  'MISSING_PAYER',
  'UNKNOWN_MEMBER',
  'MEMBERSHIP_CONFLICT',
  'EX_MEMBER_EXPENSE',
  'SETTLEMENT_AS_EXPENSE',
  'CURRENCY_MISMATCH',
  'INVALID_AMOUNT',
  'NEGATIVE_AMOUNT',
  'INVALID_PERCENTAGE_SPLIT',
  'UNEQUAL_SPLIT_MISMATCH',
  'PRECISION_ANOMALY',
  'MISSING_EXCHANGE_RATE'
];

const Anomalies = () => {
  const { fetchPendingAnomalies, loading, error, anomalies } = useAnomalies();
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('PENDING');

  useEffect(() => {
    fetchPendingAnomalies();
  }, [fetchPendingAnomalies]);

  // Client side filtering
  const filteredAnomalies = anomalies.filter((item) => {
    const matchesSeverity = filterSeverity === 'ALL' || item.severity === filterSeverity;
    const matchesType = filterType === 'ALL' || item.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSeverity && matchesType && matchesStatus;
  });

  const formatTypeName = (type) => {
    if (type === 'ALL') return 'All Types';
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Pending Anomalies Queue"
        subtitle="Review and resolve transactional warnings and anomalies raised by the audit engine before processing CSV records."
      />

      {/* Filters Bar */}
      <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col md:flex-row md:items-center gap-4">
        {/* Status Filter */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-xs font-semibold focus:border-indigo-500 focus:outline-none focus:ring-0 cursor-pointer min-w-[120px]"
          >
            <option value="PENDING">Pending</option>
            <option value="ALL">All Statuses</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Severity</label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-xs font-semibold focus:border-indigo-500 focus:outline-none focus:ring-0 cursor-pointer min-w-[140px]"
          >
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev === 'ALL' ? 'All Severities' : sev}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex flex-col gap-1.5 flex-grow">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Anomaly Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 text-xs font-semibold focus:border-indigo-500 focus:outline-none focus:ring-0 cursor-pointer w-full"
          >
            {TYPES.map((type) => (
              <option key={type} value={type}>
                {formatTypeName(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-12 bg-slate-900 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-900 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-900 rounded-xl w-full"></div>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-2xl">
          {error}
        </div>
      ) : filteredAnomalies.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-slate-900 rounded-2xl bg-slate-950/10 backdrop-blur-sm flex flex-col items-center gap-3">
          <svg className="w-10 h-10 text-slate-650" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h4 className="text-sm font-bold text-slate-350">Queue is Clear!</h4>
          <p className="text-xs text-slate-550 max-w-sm px-6">
            No pending anomalies match the selected filters. All transactions are fully audited or resolved.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop View Table */}
          <div className="hidden md:block">
            <AnomalyTable anomalies={filteredAnomalies} />
          </div>

          {/* Mobile Grid View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredAnomalies.map((anomaly) => (
              <AnomalyCard key={anomaly.id} anomaly={anomaly} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Anomalies;
