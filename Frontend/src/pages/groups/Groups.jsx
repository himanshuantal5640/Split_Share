import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import GroupCard from '../../components/groups/GroupCard';
import { listGroups } from '../../api/groupApi';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch groups. Make sure the server is online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Group Management"
        subtitle="Manage and split expenses across roommates, trips, and social circles."
        actions={
          <Link
            to="/groups/create"
            className="px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Group
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
              onClick={fetchGroups}
              className="w-fit text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline text-left"
            >
              Try Reloading
            </button>
          </div>
        </div>
      )}

      {loading ? (
        // Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 flex flex-col gap-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-slate-800 rounded-lg w-[60%]"></div>
                <div className="h-6 bg-slate-800 rounded-full w-[25%]"></div>
              </div>
              <div className="space-y-2 mt-2">
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-[80%]"></div>
              </div>
              <div className="border-t border-slate-900 pt-4 mt-4 flex justify-between items-center">
                <div className="h-3 bg-slate-800 rounded w-[40%]"></div>
                <div className="h-3 bg-slate-800 rounded w-[15%]"></div>
              </div>
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-2xl font-semibold">
            👥
          </div>
          <h3 className="text-lg font-bold text-slate-100">No Groups Found</h3>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            You are not currently registered as an active member in any expense groups. Create one to start tracking splits.
          </p>
          <Link
            to="/groups/create"
            className="px-5 py-2.5 mt-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow shadow-indigo-500/10"
          >
            Create First Group
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;
