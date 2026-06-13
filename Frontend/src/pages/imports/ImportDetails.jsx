import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ImportStatusBadge from '../../components/imports/ImportStatusBadge';
import ImportRowsTable from '../../components/imports/ImportRowsTable';
import { useImports } from '../../hooks/useImports';

const ImportDetails = () => {
  const { importId } = useParams();
  const { fetchImportDetails, loading, error } = useImports();
  const [importData, setImportData] = useState(null);

  const loadDetails = async () => {
    try {
      const data = await fetchImportDetails(parseInt(importId, 10));
      setImportData(data);
    } catch (err) {
      console.error(err);
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
