import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users away from login
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative">
      {/* Dynamic Background Blurs specifically for Login card */}
      <div className="absolute w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[110px] -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-md w-full p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-2xl flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In Portal
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Access your shared expense metrics and calculations.
          </p>
        </div>

        <LoginForm />

        <div className="text-center text-sm border-t border-slate-900 pt-4 mt-2">
          <span className="text-slate-400">New to SpitExpense? </span>
          <Link
            to="/register"
            className="text-indigo-400 font-semibold hover:text-indigo-350 transition-colors"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
