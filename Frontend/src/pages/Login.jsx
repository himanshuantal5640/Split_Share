import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSimulateLogin = async () => {
    try {
      await login('tester@spitexpense.com', 'password');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-2xl flex flex-col items-center text-center gap-6">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-white">Sign In Gateway</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            This page represents the login portal. Since full forms are not implemented yet, you can trigger a simulated session.
          </p>
        </div>

        <button
          onClick={handleSimulateLogin}
          className="w-full py-3 px-6 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all duration-300 cursor-pointer"
        >
          Simulate Authentication Session
        </button>
      </div>
    </div>
  );
};

export default Login;
