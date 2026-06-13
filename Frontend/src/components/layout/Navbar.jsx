import React from 'react';
import { Link } from 'react-router-dom';
import UserMenu from './UserMenu';

const Navbar = ({ onMenuToggle }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Burger button for collapsible mobile sidebar */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo / Brand Name */}
          <Link to="/" className="flex items-center gap-2 group md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-md shadow shadow-indigo-500/10">
              S
            </div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-50 to-slate-200 bg-clip-text text-transparent group-hover:text-indigo-400 transition-colors">
              SpitExpense
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-400">
              Production Workspace
            </span>
          </div>
        </div>

        {/* User Info & Dropdown Menu */}
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
