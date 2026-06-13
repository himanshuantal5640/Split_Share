import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSimulateRegister = async () => {
    try {
      await register('New User', 'newuser@spitexpense.com', 'password');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white">Register Account</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            This page represents the registration gateway. Since forms are deferred, you can create a test user profile below.
          </p>
        </div>

        <button
          onClick={handleSimulateRegister}
          className="w-full py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 cursor-pointer"
        >
          Generate Profile & Sign In
        </button>
      </div>
    </div>
  );
};

export default Register;
