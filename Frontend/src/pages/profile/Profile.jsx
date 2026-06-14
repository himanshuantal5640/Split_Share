import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../api/profileApi';
import PageHeader from '../../components/layout/PageHeader';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedUser = await updateProfile({ name, avatarUrl: avatarUrl || null });
      updateUser(updatedUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Profile"
        subtitle="Manage your profile information and account details."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
        {/* Profile Details Card */}
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md flex flex-col items-center text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold uppercase shadow-lg shadow-indigo-500/10">
            {initial}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-slate-100">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <div className="w-full border-t border-slate-900/60 pt-4 mt-2 flex flex-col gap-2.5 text-left text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Account ID</span>
              <span className="font-mono text-slate-300">#{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Membership status</span>
              <span className="font-semibold text-emerald-400 uppercase tracking-wide">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md flex flex-col gap-6">
          <h3 className="text-base font-bold text-slate-200">Edit Profile Details</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avatar Image URL (Optional)</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
                className="w-full px-4 py-3 rounded-xl border border-slate-850 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-900 bg-slate-950/40 text-slate-500 cursor-not-allowed text-sm"
              />
              <span className="text-[10px] text-slate-500">Email addresses are unique account identifiers and cannot be modified self-service.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-fit px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
