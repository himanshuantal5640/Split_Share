import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ResolutionSummaryCard from '../../components/anomalies/ResolutionSummaryCard';
import SeverityBadge from '../../components/anomalies/SeverityBadge';
import AnomalyStatusBadge from '../../components/anomalies/AnomalyStatusBadge';
import { useAnomalies } from '../../hooks/useAnomalies';

const formatTypeName = (type) => {
  if (!type) return '';
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const ResolutionReport = () => {
  const { importId } = useParams();
  const { fetchResolutionReport, loading, error } = useAnomalies();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await fetchResolutionReport(importId);
        setReport(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadReport();
  }, [importId]);

  if (loading && !report) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-[40%] mb-4"></div>
        <div className="h-[120px] bg-slate-900 rounded-2xl mb-4"></div>
        <div className="h-[250px] bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-2xl flex flex-col gap-4">
        <span>{error}</span>
        <Link to={`/imports/${importId}`} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline">
          Back to Import Details
        </Link>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Import Resolution Report"
        subtitle={`Audit reconciliation summary for file: ${report.originalFilename}`}
        actions={
          <Link
            to={`/imports/${importId}`}
            className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            Back to Import
          </Link>
        }
      />

      {/* Summary Statistics Card Block */}
      <ResolutionSummaryCard
        total={report.totalAnomalies}
        approved={report.approvedCount}
        rejected={report.rejectedCount}
        pending={report.pendingCount}
      />

      {/* Detail Audit Table */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-350 uppercase tracking-wider">
          Anomaly Resolution Logs
        </h3>

        {report.anomalies.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-900 rounded-2xl bg-slate-950/10 text-slate-500 text-xs">
            No anomalies identified for this import transaction file.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-wider bg-slate-950/40">
                  <th className="py-4.5 px-6">Row</th>
                  <th className="py-4.5 px-6">Anomaly</th>
                  <th className="py-4.5 px-6">Severity</th>
                  <th className="py-4.5 px-6">Status</th>
                  <th className="py-4.5 px-6">Resolution Audit Trail Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-slate-350 text-xs">
                {report.anomalies.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-4.5 px-6 font-semibold text-slate-400">#{a.rowNumber}</td>
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-200">{formatTypeName(a.type)}</span>
                        <span className="text-[10px] text-slate-500 max-w-sm line-clamp-1" title={a.description}>
                          {a.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-4.5 px-6">
                      <SeverityBadge severity={a.severity} />
                    </td>
                    <td className="py-4.5 px-6">
                      <AnomalyStatusBadge status={a.status} />
                    </td>
                    <td className="py-4.5 px-6">
                      {a.status === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-semibold">Pending Review</span>
                          <Link
                            to={`/anomalies/${a.id}`}
                            className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                          >
                            Resolve Now
                          </Link>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1.5 max-w-md">
                          <p className="text-slate-350 italic">"{a.resolutionNote}"</p>
                          <span className="text-[10px] text-slate-550">
                            By {a.resolvedBy?.name || 'Unknown'} on {new Date(a.resolvedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResolutionReport;
