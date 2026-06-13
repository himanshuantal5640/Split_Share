import React, { useState, useRef } from 'react';
import UploadProgress from './UploadProgress';

const ImportUploadForm = ({ onSubmit, loading = false, progress = 0, error = null }) => {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    setValidationError(null);
    if (!selectedFile) return;

    // 1. Extension / Mime validation
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    const allowedMimeTypes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/comma-separated-values'];
    const isCsv = fileExtension === 'csv' || allowedMimeTypes.includes(selectedFile.type);

    if (!isCsv) {
      setValidationError('Please select a valid CSV spreadsheet document.');
      setFile(null);
      return;
    }

    // 2. Size validation (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      setValidationError('File size exceeds 5MB limit. Please upload a smaller CSV.');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (loading) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerBrowse = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setValidationError('Please choose or drop a CSV file first.');
      return;
    }
    onSubmit(file);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {(error || validationError) && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed flex items-start gap-2.5">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        className={`w-full min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 px-6 py-8 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-950/10'
            : 'border-slate-800 bg-slate-950/20 hover:border-slate-700/80 hover:bg-slate-950/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
        />

        {/* Dynamic Glow backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:to-indigo-500/2 transition-all duration-300 pointer-events-none" />

        <div className={`p-4 rounded-xl border border-slate-900 bg-slate-950 flex items-center justify-center text-slate-450 group-hover:text-indigo-400 group-hover:border-indigo-500/10 group-hover:bg-indigo-500/5 transition-all duration-300 ${isDragActive ? 'text-indigo-400 border-indigo-500/15 bg-indigo-500/5' : ''}`}>
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-sm font-bold text-slate-200">
            Drag & drop CSV document here
          </p>
          <p className="text-xs text-slate-500">
            or <span className="text-indigo-400 font-semibold underline group-hover:text-indigo-300">browse folders</span> to choose a file
          </p>
        </div>

        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">
          Supported format: CSV (Max size 5MB)
        </p>
      </div>

      {/* Selected File Details */}
      {file && (
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg font-bold">
              📄
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-slate-200 line-clamp-1">
                {file.name}
              </span>
              <span className="text-[10px] text-slate-500 tracking-wide">
                {formatBytes(file.size)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Progress Bar */}
      {loading && progress > 0 && (
        <UploadProgress progress={progress} />
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full py-4 px-6 mt-2 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
      >
        {loading ? 'Processing Upload...' : 'Upload & Parse CSV'}
      </button>
    </form>
  );
};

export default ImportUploadForm;
