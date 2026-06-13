import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import BalanceBreakdown from '../../components/balances/BalanceBreakdown';
import BalanceCard from '../../components/balances/BalanceCard';
import RecommendationsPanel from '../../components/balances/RecommendationsPanel';
import { useBalances } from '../../hooks/useBalances';
import { useAuth } from '../../context/AuthContext';

const BalanceDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    userBalances,
    userBreakdown,
    recommendations,
    loading,
    error,
    fetchUserBalances,
    fetchUserBreakdown,
    fetchRecommendations,
  } = useBalances();

  useEffect(() => {
    if (!user?.id) return;
    fetchUserBalances(user.id).catch(console.error);
    fetchUserBreakdown(user.id).catch(console.error);
    fetchRecommendations(user.id).catch(console.error);
  }, [user?.id]);

  const totalOwed = parseFloat(userBalances?.totalOwed || userBalances?.owed || 0);
  const totalOwe = parseFloat(userBalances?.totalOwe || userBalances?.owes || 0);
  const net = totalOwed - totalOwe;
  const currency = userBalances?.currency || 'USD';

  const breakdown = userBreakdown?.breakdown || userBreakdown?.groups || (Array.isArray(userBreakdown) ? userBreakdown : []);
  const recommendationList = recommendations?.recommendations || (Array.isArray(recommendations) ? recommendations : []);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Balance Summary"
        subtitle={`Personal balance overview for ${user?.name || user?.email || 'your account'}.`}
        actions={
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-800 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
        }
      />

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm flex items-start gap-2.5 max-w-2xl">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-6 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-slate-900 rounded-2xl" />)}
          </div>
          <div className="h-48 bg-slate-900 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BalanceCard
              label="Total Owed to You"
              amount={totalOwed}
              currency={currency}
              variant="owed"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              }
            />
            <BalanceCard
              label="Total You Owe"
              amount={totalOwe}
              currency={currency}
              variant="owe"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              }
            />
            <BalanceCard
              label="Net Balance"
              amount={net}
              currency={currency}
              variant="net"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              }
            />
          </div>

          {/* Group-by-Group Breakdown */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-100">Breakdown by Group</h2>
              <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                {breakdown.length} group{breakdown.length !== 1 ? 's' : ''}
              </span>
            </div>
            <BalanceBreakdown breakdown={breakdown} />
          </section>

          {/* Smart Recommendations */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-100">Smart Recommendations</h2>
              {recommendationList.length > 0 && (
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">
                  {recommendationList.length} action{recommendationList.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <RecommendationsPanel recommendations={recommendationList} />
          </section>
        </>
      )}
    </div>
  );
};

export default BalanceDetails;
