import React, { useState } from 'react';
import api from '../../api/axios';

const GroupForm = ({ onSubmit, initialData = {}, loading = false, error = null }) => {
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);

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

  const handleSelectMember = (user) => {
    if (selectedMembers.some((m) => m.id === user.id)) {
      setSearchQuery('');
      setSearchResults([]);
      return;
    }
    setSelectedMembers([...selectedMembers, user]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter((m) => m.id !== userId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Group Name is required.');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      memberIds: selectedMembers.map((m) => m.id),
    });
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

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          placeholder="e.g. Roommates Flat 3B"
          className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
          placeholder="Describe the purpose of this group circle..."
          rows={4}
          className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
      </div>

      <div className="flex flex-col gap-2 relative">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Group Members</label>
        
        {/* Selected Members Chips */}
        {selectedMembers.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedMembers.map((member) => (
              <span
                key={member.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              >
                {member.name} ({member.email})
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-indigo-400 hover:text-indigo-200 transition-colors focus:outline-none cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        )}

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          disabled={loading}
          placeholder="Search by name or email address..."
          className="w-full px-4 py-3.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 shadow-2xl z-50 p-2 flex flex-col gap-1">
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectMember(user)}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-slate-405 hover:text-slate-100 hover:bg-slate-900/40 transition-colors flex justify-between items-center cursor-pointer"
              >
                <span>{user.name} ({user.email})</span>
                <span className="text-[10px] text-indigo-400 font-bold uppercase">Add</span>
              </button>
            ))}
          </div>
        )}
        
        {searchQuery && searchResults.length === 0 && !searchLoading && (
          <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-center text-xs text-slate-500 z-50">
            No users found matching "{searchQuery}"
          </div>
        )}

        <span className="text-[10px] text-slate-500 font-semibold leading-relaxed">
          * Search for existing users in the system to add them directly to this group.
        </span>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-6 mt-2 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-xl shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Saving group configurations...</span>
          </>
        ) : (
          <span>Confirm & Create Group</span>
        )}
      </button>
    </form>
  );
};

export default GroupForm;
