import React, { useState } from 'react';
import { addGroupMember } from '../../api/groupApi';

const AddMemberModal = ({ isOpen, onClose, onAdd, groupId }) => {
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const id = parseInt(userId, 10);
    if (isNaN(id) || id <= 0) {
      setError('Please enter a valid positive User ID.');
      return;
    }

    setLoading(true);
    try {
      await addGroupMember(groupId, id);
      onAdd();
      setUserId('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to add member. Make sure the User ID exists and is not already a member.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Card */}
      <div className="relative max-w-md w-full p-6 rounded-2xl border border-slate-900 bg-slate-950 shadow-2xl flex flex-col gap-5 z-10 animate-scale-up">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Add Group Member</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-xs leading-relaxed flex items-start gap-2.5">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">User ID (Numeric)</label>
            <input
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 tracking-wide">
            <span>* The system will automatically log the Joined Date to the database on approval.</span>
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-slate-900 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55"
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
