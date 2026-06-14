import React, { useState } from 'react';
import api from '../../api/axios';
import { addGroupMember } from '../../api/groupApi';

const AddMemberModal = ({ isOpen, onClose, onAdd, groupId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await api.get(`/auth/users/search?q=${encodeURIComponent(query)}`);
      if (res.data && res.data.success) {
        setSearchResults(res.data.data.users || []);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveSelection = () => {
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedUser) {
      setError('Please search and select a member to add.');
      return;
    }

    setLoading(true);
    try {
      await addGroupMember(groupId, selectedUser.id);
      onAdd();
      setSelectedUser(null);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to add member. Make sure the user is not already a member.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={handleClose}></div>

      {/* Modal Card */}
      <div className="relative max-w-md w-full p-6 rounded-2xl border border-slate-900 bg-slate-950 shadow-2xl flex flex-col gap-5 z-10 animate-scale-up">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Add Group Member</h3>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors cursor-pointer"
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

          <div className="flex flex-col gap-2 relative">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search & Select Member</label>
            
            {/* Selected User display */}
            {selectedUser ? (
              <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold flex items-center justify-between gap-4">
                <span>{selectedUser.name} ({selectedUser.email})</span>
                <button
                  type="button"
                  onClick={handleRemoveSelection}
                  className="text-indigo-400 hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer text-sm"
                >
                  &times;
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Type name or email..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-650 focus:outline-none focus:border-indigo-500 transition-colors"
                  required={!selectedUser}
                />

                {/* Dropdown results */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl z-50 p-2 flex flex-col gap-1">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 transition-colors flex justify-between items-center cursor-pointer"
                      >
                        <span>{user.name} ({user.email})</span>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase">Select</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery && searchResults.length === 0 && !searchLoading && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3 text-center text-xs text-slate-500 z-50">
                    No users found matching "{searchQuery}"
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1 text-[10px] font-semibold text-slate-500 tracking-wide mt-2">
            <span>* Active members will automatically see this group circle on their dashboard.</span>
          </div>

          <div className="flex justify-end gap-3 mt-4 border-t border-slate-900 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedUser}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
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
