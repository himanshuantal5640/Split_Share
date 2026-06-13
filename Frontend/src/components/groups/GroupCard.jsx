import React from 'react';
import { Link } from 'react-router-dom';

const GroupCard = ({ group }) => {
  const memberCount = group.memberships?.length || 0;

  return (
    <Link
      to={`/groups/${group.id}`}
      className="block p-6 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-indigo-500/35 hover:bg-slate-900/10 transition-all duration-300 group shadow-md"
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
            {group.name}
          </h3>
          <span className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {memberCount} {memberCount === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed min-h-[40px]">
          {group.description || 'No description provided for this group circle.'}
        </p>

        <div className="flex items-center justify-between border-t border-slate-900 pt-4 mt-2">
          <span className="text-xs text-slate-500">
            Created {new Date(group.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
          </span>
          <span className="text-xs font-semibold text-indigo-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
            Details
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
