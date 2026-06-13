import React, { useState } from 'react';

const deliverables = [
  {
    id: 'readme',
    label: 'README.md',
    description: 'Project overview, setup instructions, and feature documentation.',
    icon: '📄',
    gradient: 'from-indigo-500 to-violet-600',
  },
  {
    id: 'scope',
    label: 'SCOPE.md',
    description: 'Defined boundaries, included and excluded features, MVP definition.',
    icon: '🎯',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    id: 'decisions',
    label: 'DECISIONS.md',
    description: 'Architecture decisions, technology choices, and design rationale.',
    icon: '🧭',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'ai_usage',
    label: 'AI_USAGE.md',
    description: 'Documentation of AI tools and prompts used during development.',
    icon: '🤖',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'github',
    label: 'GitHub Repository',
    description: 'Source code hosted on GitHub with commit history.',
    icon: '🐙',
    gradient: 'from-slate-500 to-slate-700',
  },
  {
    id: 'deployment',
    label: 'Deployment URL',
    description: 'Live production deployment accessible via public URL.',
    icon: '🚀',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

/**
 * DeliverablesChecklist — interactive final submission checklist.
 * Props: initialChecked (object mapping deliverable id -> boolean)
 */
const DeliverablesChecklist = ({ initialChecked = {} }) => {
  const [checked, setChecked] = useState(() => {
    const base = {};
    deliverables.forEach((d) => { base[d.id] = false; });
    return { ...base, ...initialChecked };
  });

  const toggle = (id) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const completedCount = Object.values(checked).filter(Boolean).length;
  const total = deliverables.length;
  const progress = Math.round((completedCount / total) * 100);

  const allDone = completedCount === total;

  return (
    <div className="rounded-2xl border border-slate-800/60 bg-slate-900/60 backdrop-blur-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-100">Final Deliverables</h3>
          <p className="text-xs text-slate-500 mt-0.5">Track completion of all required submission artifacts.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            {completedCount}/{total}
          </p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Complete</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
          <span>Submission progress</span>
          <span className="font-bold text-slate-300">{progress}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${allDone ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-violet-600'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* All done banner */}
      {allDone && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
          <span className="text-xl">🎉</span>
          <div>
            <p className="text-sm font-bold text-emerald-400">All deliverables complete!</p>
            <p className="text-xs text-emerald-400/60">Ready for final submission.</p>
          </div>
        </div>
      )}

      {/* Checklist */}
      <div className="space-y-2">
        {deliverables.map((d) => {
          const isChecked = checked[d.id];
          return (
            <label
              key={d.id}
              htmlFor={`deliverable-${d.id}`}
              className={`flex items-center gap-4 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                isChecked
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-800/60 bg-slate-950/30 hover:border-slate-700 hover:bg-slate-800/20'
              }`}
            >
              {/* Custom checkbox */}
              <div className="relative shrink-0">
                <input
                  id={`deliverable-${d.id}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(d.id)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                  isChecked
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-600 bg-slate-900'
                }`}>
                  {isChecked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Icon */}
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${d.gradient} flex items-center justify-center text-sm shrink-0 opacity-80`}>
                {d.icon}
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold transition-colors ${isChecked ? 'text-emerald-400 line-through decoration-emerald-500/40' : 'text-slate-200'}`}>
                  {d.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{d.description}</p>
              </div>

              {isChecked && (
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default DeliverablesChecklist;
