import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition-all duration-200 cursor-pointer focus:outline-none"
      >
        <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold uppercase shadow-sm">
          {user.name.charAt(0)}
        </div>
        <span className="hidden md:block text-sm font-semibold text-slate-200 pr-1">
          {user.name}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-60 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl backdrop-blur-md animate-fade-in z-50">
          {/* User Details */}
          <div className="px-3.5 py-3 border-b border-slate-900 flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-100">{user.name}</span>
            <span className="text-xs text-slate-500 truncate">{user.email}</span>
          </div>

          {/* Menu Actions */}
          <div className="py-1.5 flex flex-col gap-0.5">
            <button
              onClick={() => {
                setIsOpen(false);
                alert('Profile settings will be introduced in subsequent dashboard updates!');
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 transition-colors"
            >
              My Profile
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                alert('Account preferences and theme settings will be configurable soon.');
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-900/40 transition-colors"
            >
              Account Settings
            </button>
          </div>

          {/* Logout Button */}
          <div className="border-t border-slate-900 pt-1.5 mt-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/10 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
