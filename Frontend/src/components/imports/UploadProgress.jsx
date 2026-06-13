import React from 'react';

const UploadProgress = ({ progress = 0 }) => {
  const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
        <span>Uploading to Server...</span>
        <span className="text-indigo-400">{roundedProgress}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${roundedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
