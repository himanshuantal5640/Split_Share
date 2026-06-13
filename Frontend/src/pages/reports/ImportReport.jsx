import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ImportSummaryCard from '../../components/reports/ImportSummaryCard';
import AnomalySummaryTable from '../../components/reports/AnomalySummaryTable';
import ResolutionSummaryTable from '../../components/reports/ResolutionSummaryTable';
import { useReports } from '../../hooks/useReports';

const SectionCard = ({ title, subtitle, icon, children }) => (
  <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
    <div className="flex items-center gap-3 p-5 border-b border-slate-800/60">
      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-base">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-100">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const StatPill = ({ label, value, color = 'text-slate-200' }) => (
  <div className="flex flex-col items-center justify-center px-5 py-3 rounded-xl bg-slate-950/50 border border-slate-800/60 gap-0.5">
    <span className={`text-xl font-bold ${color}`}>{value}</span>
    <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

const ImportReport = () => {
  const { importId } = useParams();
  const { importReport, loading, error, fetchImportReport } = useReports();

  useEffect(() => {
    if (importId) {
      fetchImportReport(importId).catch(console.error);
    }
  }, [importId, fetchImportReport]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Import Report #${importId}`}
        subtitle="Full processing summary including anomalies detected and resolutions applied."
        actions={
          <div className="flex gap-2.5">
            <Link
              to={`/reports/audit/${importId}`}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-violet-500/30 text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all duration-200 flex items-center gap-2"
            >
              🔍 View Audit Trail
            </Link>
            <Link
              to="/reports"
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-all duration-200"
            >
              ← Back to Reports
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

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-36 bg-slate-900 rounded-2xl" />
          <div className="h-48 bg-slate-900 rounded-2xl" />
          <div className="h-40 bg-slate-900 rounded-2xl" />
        </div>
      ) : importReport ? (
        <div className="flex flex-col gap-6">
          {/* Import Summary */}
          <SectionCard title="Import Summary" subtitle="File metadata and processing outcome." icon="📄">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <ImportSummaryCard
                  importId={importReport.importId}
                  originalFilename={importReport.summary?.originalFilename}
                  status={importReport.summary?.status}
                  totalRows={importReport.summary?.totalRows}
                  importedRowsCount={importReport.summary?.importedRowsCount}
                  failedRowsCount={importReport.summary?.failedRowsCount}
                  uploadedBy={importReport.summary?.uploadedBy}
                  createdAt={importReport.summary?.createdAt}
                />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-4">
                {/* Processed records stats */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">Processed Records</p>
                  <div className="flex gap-3">
                    <StatPill label="Expenses" value={importReport.processedRecords?.expensesGeneratedCount ?? 0} color="text-emerald-400" />
                    <StatPill label="Settlements" value={importReport.processedRecords?.settlementsGeneratedCount ?? 0} color="text-blue-400" />
                    <StatPill label="Anomalies" value={importReport.anomalies?.length ?? 0} color="text-amber-400" />
                    <StatPill label="Resolutions" value={importReport.resolutions?.length ?? 0} color="text-violet-400" />
                  </div>
                </div>

                {/* Error log */}
                {importReport.summary?.errorLog && (
                  <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-500/70 mb-1.5">Error Log</p>
                    <p className="text-xs text-red-400 font-mono leading-relaxed">{importReport.summary.errorLog}</p>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Anomaly Summary */}
          <SectionCard
            title="Anomaly Summary"
            subtitle={`${importReport.anomalies?.length ?? 0} anomalies detected during processing.`}
            icon="⚠️"
          >
            <AnomalySummaryTable anomalies={importReport.anomalies ?? []} />
          </SectionCard>

          {/* Resolution Summary */}
          <SectionCard
            title="Resolution Summary"
            subtitle={`${importReport.resolutions?.length ?? 0} anomalies resolved by reviewers.`}
            icon="✅"
          >
            <ResolutionSummaryTable resolutions={importReport.resolutions ?? []} />
          </SectionCard>
        </div>
      ) : !error ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/30">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-2xl">📊</div>
          <p className="text-slate-400 text-sm">No report data available for import #{importId}.</p>
        </div>
      ) : null}
    </div>
  );
};

export default ImportReport;
