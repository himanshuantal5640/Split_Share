import React, { useState } from 'react';
import { updateProfile } from '../../api/profileApi';
import PageHeader from '../../components/layout/PageHeader';
import { Eye, EyeOff } from 'lucide-react';

const AccountSettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account Settings"
        subtitle="Configure your password and security credentials."
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm flex items-start gap-2.5 max-w-2xl">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-sm flex items-start gap-2.5 max-w-2xl">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <div className="max-w-2xl p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md flex flex-col gap-6">
        <h3 className="text-base font-bold text-slate-200">Change Password</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Password</label>
            <div className="relative w-full">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-850 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors focus:outline-none cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
            <div className="relative w-full">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-850 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors focus:outline-none cursor-pointer"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                className="w-full pl-4 pr-11 py-3 rounded-xl border border-slate-850 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 transition-colors focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-fit px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer"
          >
            {loading ? 'Updating Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
