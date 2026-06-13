import React from 'react';

// Formats date nicely
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

export const ActiveMembersTable = ({ members, onRemoveClick, currentUserId }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <th className="px-6 py-4">User ID</th>
            <th className="px-6 py-4">Member Name</th>
            <th className="px-6 py-4">Email Address</th>
            <th className="px-6 py-4">Joined Date</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
          {members.length === 0 ? (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                No active members found in this group circle.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <tr key={member.userId} className="hover:bg-slate-900/10 transition-colors">
                <td className="px-6 py-4 text-xs font-mono text-slate-500">#{member.userId}</td>
                <td className="px-6 py-4 text-slate-200">
                  {member.name} 
                  {member.userId === currentUserId && (
                    <span className="text-[10px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded ml-1.5">
                      You
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400">{member.email}</td>
                <td className="px-6 py-4 text-slate-400">{formatDate(member.joinedAt)}</td>
                <td className="px-6 py-4 text-right">
                  {member.userId !== currentUserId ? (
                    <button
                      onClick={() => onRemoveClick(member)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 hover:border-red-500/30 text-slate-450 hover:text-red-400 hover:bg-red-950/10 transition-all duration-200 cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 italic px-3">Owner (Admin)</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const MembershipHistoryTable = ({ history }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950/20">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-900 bg-slate-950/40 text-slate-400 font-semibold text-xs tracking-wider uppercase">
            <th className="px-6 py-4">Member</th>
            <th className="px-6 py-4">Joined Date</th>
            <th className="px-6 py-4">Left Date</th>
            <th className="px-6 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900 text-slate-300 font-medium">
          {history.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                No historic membership records found.
              </td>
            </tr>
          ) : (
            history.map((record, index) => (
              <tr key={index} className="hover:bg-slate-900/10 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-slate-200">{record.name}</span>
                    <span className="text-xs text-slate-500">{record.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-400">{formatDate(record.joinedAt)}</td>
                <td className="px-6 py-4 text-slate-400">{formatDate(record.leftAt)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                    record.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-900 text-slate-500 border border-slate-800/40'
                  }`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
