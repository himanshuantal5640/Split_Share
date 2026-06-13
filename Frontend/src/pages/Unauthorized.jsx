import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Access Denied / Unauthorized Page.
 */
const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 relative">
      {/* Amber alert ambient glow */}
      <div className="absolute w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-2xl flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-3xl font-extrabold animate-pulse">
          🔒
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">
            403
          </h1>
          <h2 className="text-xl font-bold text-slate-100">
            Access Restricted
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            You do not possess the necessary authorization credentials to view this page. If you believe this is an error, please verify your session logs.
          </p>
        </div>

        <Link
          to="/"
          className="w-full py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 text-center"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
