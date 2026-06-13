import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard component for routes requiring user authentication.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show a premium loading indicator while checking local authentication token
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-b-2 border-l-2 border-emerald-500 animate-spin" style={{ animationDirection: 'reverse' }}></div>
        </div>
        <p className="mt-4 text-slate-400 font-medium tracking-wide animate-pulse">
          Restoring secure session...
        </p>
      </div>
    );
  }

  // Redirect to login page if user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
