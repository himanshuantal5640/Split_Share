import React, { useState } from 'react';

const ResolutionNotesForm = ({ onSubmit, onCancel, submitLabel = 'Submit', loading = false }) => {
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = note.trim();
    if (trimmed.length < 3) {
      setError('Resolution note must be at least 3 characters long.');
      return;
    }
    setError(null);
    onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="resolutionNote" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Resolution Explanation Note
        </label>
        <textarea
          id="resolutionNote"
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            if (e.target.value.trim().length >= 3) {
              setError(null);
            }
          }}
          disabled={loading}
          rows={3}
          placeholder="Explain why this anomaly is being resolved (e.g., duplicate row confirmed, registered missing member...)"
          className="w-full rounded-xl border border-slate-800 bg-slate-950 text-slate-100 p-3.5 text-sm placeholder-slate-600 focus:border-indigo-500 focus:outline-none transition-colors resize-none disabled:opacity-50"
        />
        {error && (
          <span className="text-xs font-semibold text-red-400 mt-1">
            {error}
          </span>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-650 disabled:bg-indigo-500/50 text-white shadow-lg shadow-indigo-500/10 transition-all flex items-center justify-center min-w-[80px]"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

export default ResolutionNotesForm;
