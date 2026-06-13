import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-8">
      <div className="p-8 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-xl flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white">
          Secure User Dashboard
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Welcome to the protected application area, <span className="text-indigo-400 font-semibold">{user?.name}</span>. 
          Your email address is registered as <span className="text-emerald-400 font-medium">{user?.email}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/20 flex flex-col gap-2">
          <h3 className="font-semibold text-slate-200">Verification Status</h3>
          <p className="text-sm text-slate-450 leading-relaxed">
            Authorization state verified via Local JWT interceptor. Routes are secured under &lt;ProtectedRoute&gt; wrapper.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-slate-900 bg-slate-950/20 flex flex-col gap-2">
          <h3 className="font-semibold text-slate-200">Next Phase Objectives</h3>
          <p className="text-sm text-slate-450 leading-relaxed">
            CRUD interfaces, transaction histories, debt graphs, and CSV imports will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
