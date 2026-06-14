import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ImportStatusBadge from '../../components/imports/ImportStatusBadge';
import ImportRowsTable from '../../components/imports/ImportRowsTable';
import { useImports } from '../../hooks/useImports';
import { useAnomalies } from '../../hooks/useAnomalies';

const ImportDetails = () => {
  const { importId } = useParams();
  const { fetchImportDetails, processImportJob, loading, error } = useImports();
  const { fetchImportAnomalies, analyzeImport, loading: anomalyLoading } = useAnomalies();
  const [importData, setImportData] = useState(null);
  const [anomaliesList, setAnomaliesList] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processSuccess, setProcessSuccess] = useState(null);
  const [processingError, setProcessingError] = useState(null);

  const loadAnomalies = async () => {
    try {
      const data = await fetchImportAnomalies(parseInt(importId, 10));
      setAnomaliesList(data || []);
    } catch (err) {
      console.error('Failed to load anomalies for import', err);
    }
  };

  const loadDetails = async () => {
    try {
      const data = await fetchImportDetails(parseInt(importId, 10));
      setImportData(data);
      if (data && data.status === 'COMPLETED') {
        loadAnomalies();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnalyze = async () => {
    try {
      await analyzeImport(parseInt(importId, 10));
      loadDetails();
    } catch (err) {
      console.error('Failed to analyze anomalies', err);
    }
  };

  const handleProcess = async () => {
    setProcessing(true);
    setProcessingError(null);
    setProcessSuccess(null);
    try {
      const report = await processImportJob(parseInt(importId, 10));
      setProcessSuccess(report);
      loadDetails();
    } catch (err) {
      console.error(err);
      setProcessingError(err.response?.data?.message || 'Failed to process import ledger.');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [importId]);

  if (loading && !importData) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-[40%] mb-4"></div>
        <div className="h-[250px] bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  if (error && !importData) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-2xl flex flex-col gap-4">
        <span>{error}</span>
        <Link to="/imports" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline">
          Back to Import Logs
        </Link>
      </div>
    );
  }

  if (!importData) return null;

  const dateFormatted = new Date(importData.createdAt).toLocaleDateString(undefined, {
    dateStyle: 'full',
  });
  const timeFormatted = new Date(importData.createdAt).toLocaleTimeString(undefined, {
    timeStyle: 'short',
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={importData.originalFilename}
        subtitle={`Import job #${importData.id} initialized on ${dateFormatted} at ${timeFormatted}`}
        actions={
          <Link
            to="/imports"
            className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            Back
          </Link>
        }
      />

      {/* Overview Metadata Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Status Card */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col justify-between gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Job Status
          </span>
          <div className="mt-2">
            <ImportStatusBadge status={importData.status} />
          </div>
          <span className="text-[10px] text-slate-550 block mt-2">
            Group: {importData.group?.name || `ID #${importData.groupId}`}
          </span>
        </div>

        {/* Total Rows Card */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Total Rows Parsed
          </span>
          <span className="text-3xl font-black text-slate-100 mt-1">
            {importData.totalRows}
          </span>
          <span className="text-[10px] text-slate-500">Includes valid and invalid rows</span>
        </div>

        {/* Valid Rows Count Card */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
            Successfully Validated
          </span>
          <span className="text-3xl font-black text-emerald-400 mt-1">
            {importData.importedRowsCount}
          </span>
          <span className="text-[10px] text-slate-500">Rows ready to generate ledger outlays</span>
        </div>

        {/* Invalid Rows Count Card */}
        <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col gap-2">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
            Failed Validations
          </span>
          <span className="text-3xl font-black text-red-400 mt-1">
            {importData.failedRowsCount}
          </span>
          <span className="text-[10px] text-slate-500">Rows with parsing or schema errors</span>
        </div>

      </div>

      {/* Failure Log display */}
      {importData.status === 'FAILED' && importData.errorLog && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-4xl flex flex-col gap-2">
          <span className="font-bold uppercase tracking-wider text-[10px] text-red-300">
            System Failure Exception Log:
          </span>
          <p className="font-mono text-xs">{importData.errorLog}</p>
        </div>
      )}

      {processingError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-4xl flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{processingError}</span>
        </div>
      )}

      {processSuccess && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-sm leading-relaxed max-w-4xl flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex flex-col gap-1">
            <span className="font-bold">Ledger processed successfully!</span>
            <span className="text-xs text-emerald-500/90">
              Generated {processSuccess.statistics?.expensesGeneratedCount || 0} expenses and {processSuccess.statistics?.settlementsGeneratedCount || 0} peer settlements.
            </span>
          </div>
        </div>
      )}

      {/* Anomaly Audit Panel */}
      {importData.status === 'COMPLETED' && (
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Anomaly Detection & Audit Override
            </h3>
            <p className="text-xs text-slate-450 max-w-2xl leading-relaxed">
              {anomaliesList.length > 0
                ? `The audit engine identified ${anomaliesList.length} anomalies in this import. Outstanding pending flags must be overridden or skipped before the import ledger can be generated.`
                : 'Run the background audit detector to identify double entries, currency conflicts, ex-member actions, or invalid percentage splits.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Always show Run Analysis button as a secondary action if there are no pending anomalies */}
            <button
              onClick={handleAnalyze}
              disabled={anomalyLoading || processing}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-450 hover:text-white transition-colors cursor-pointer disabled:opacity-55"
            >
              {anomalyLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>

            {/* Show Process Ledger button if there are no pending anomalies */}
            {!anomaliesList.some(a => a.status === 'PENDING') && (
              <button
                onClick={handleProcess}
                disabled={processing || anomalyLoading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-55"
              >
                {processing ? 'Processing...' : 'Process Ledger'}
              </button>
            )}

            {/* Show Review Queue if there are pending anomalies */}
            {anomaliesList.some(a => a.status === 'PENDING') && (
              <Link
                to="/anomalies"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/10 transition-colors"
              >
                Review Queue
              </Link>
            )}

            {/* Show Resolution Report if there are anomalies */}
            {anomaliesList.length > 0 && (
              <Link
                to={`/imports/${importId}/resolution-report`}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white transition-colors"
              >
                Resolution Report
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Rows Table */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
            CSV File Rows Detailed Breakdown
          </h3>
          <span className="text-xs text-slate-500">
            Showing {importData.rows?.length || 0} parsed lines
          </span>
        </div>
        <ImportRowsTable rows={importData.rows || []} />
      </div>

    </div>
  );
};

export default ImportDetails;
