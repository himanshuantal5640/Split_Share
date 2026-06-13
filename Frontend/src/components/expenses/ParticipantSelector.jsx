import React from 'react';

/**
 * Validates user membership interval against transaction date.
 */
export const isUserActiveOnDate = (member, targetDate) => {
  if (!targetDate) return true;
  const checkTime = new Date(targetDate).getTime();
  const joinedTime = new Date(member.joinedAt).getTime();
  if (checkTime < joinedTime) return false;
  if (member.leftAt) {
    const leftTime = new Date(member.leftAt).getTime();
    if (checkTime > leftTime) return false;
  }
  return true;
};

const ParticipantSelector = ({ members = [], selectedIds = [], onChange, expenseDate }) => {
  const handleToggle = (userId) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Select Split Participants
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
        {members.map((member) => {
          const isActive = isUserActiveOnDate(member, expenseDate);
          const isSelected = selectedIds.includes(member.userId);

          return (
            <div
              key={member.userId}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 ${
                !isActive
                  ? 'bg-slate-950/20 border-slate-900 opacity-45 cursor-not-allowed'
                  : isSelected
                  ? 'bg-indigo-500/5 border-indigo-500/30 text-indigo-200'
                  : 'bg-slate-950/40 border-slate-900 text-slate-350 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={isSelected && isActive}
                  onChange={() => isActive && handleToggle(member.userId)}
                  disabled={!isActive}
                  className="w-4 h-4 text-indigo-500 border-slate-800 rounded bg-slate-950 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200 leading-tight">
                    {member.name}
                  </span>
                  <span className="text-[10px] text-slate-500 tracking-wide">
                    #{member.userId} • {member.email}
                  </span>
                </div>
              </div>
              {!isActive && (
                <span className="text-[9px] font-bold tracking-wide text-red-500 uppercase px-2 py-0.5 rounded bg-red-950/25 border border-red-500/20">
                  Inactive
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParticipantSelector;
