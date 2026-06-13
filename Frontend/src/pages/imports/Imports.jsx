import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import ImportTable from '../../components/imports/ImportTable';
import ImportCard from '../../components/imports/ImportCard';
import { useImports } from '../../hooks/useImports';

const Imports = () => {
  const { imports, loading, error, fetchImports } = useImports();

  useEffect(() => {
    fetchImports().catch((err) => {
      console.error('Failed to load imports history:', err);
    });
  }, [fetchImports]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="CSV Import Logs"
        subtitle="Upload and manage transaction spreadsheets for automated parsing and splits."
        actions={
          <Link
            to="/imports/upload"
            className="px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload CSV File
          </Link>
        }
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed flex items-start gap-2.5 max-w-2xl">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex flex-col gap-2">
            <span>{error}</span>
            <button
              onClick={fetchImports}
              className="w-fit text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline text-left"
            >
              Try Reloading
            </button>
          </div>
        </div>
      )}

      {loading ? (
        // Loading skeletons
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-12 bg-slate-900 rounded-xl w-full"></div>
          <div className="h-48 bg-slate-900 rounded-xl w-full"></div>
        </div>
      ) : imports.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-semibold">
            📁
          </div>
          <h3 className="text-lg font-bold text-slate-100">No Import History Found</h3>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            You haven't uploaded any expense or settlement transaction spreadsheets yet. Click the button above to upload your first CSV file.
          </p>
          <Link
            to="/imports/upload"
            className="px-5 py-2.5 mt-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow shadow-indigo-500/10"
          >
            Upload First CSV
          </Link>
        </div>
      ) : (
        <>
          {/* Table display on desktop */}
          <div className="hidden md:block">
            <ImportTable imports={imports} />
          </div>

          {/* Card list display on mobile */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {imports.map((item) => (
              <ImportCard key={item.id} importItem={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Imports;
