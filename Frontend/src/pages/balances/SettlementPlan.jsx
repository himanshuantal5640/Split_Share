import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import DebtSimplificationPanel from '../../components/balances/DebtSimplificationPanel';
import { useBalances } from '../../hooks/useBalances';
import { useAuth } from '../../context/AuthContext';
import { listGroups } from '../../api/groupApi';

const SettlementPlan = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loadingGroup, setLoadingGroup] = useState(true);

  const {
    settlementPlan,
    groupBalances,
    loading,
    error,
    fetchSettlementPlan,
    fetchGroupBalances,
  } = useBalances();

  // Load group name
  useEffect(() => {
    const load = async () => {
      try {
        const groups = await listGroups();
        const found = groups.find((g) => g.id.toString() === groupId);
        setGroup(found || { id: groupId, name: `Group #${groupId}` });
      } catch {
        setGroup({ id: groupId, name: `Group #${groupId}` });
      } finally {
        setLoadingGroup(false);
      }
    };
    if (groupId) load();
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchSettlementPlan(parseInt(groupId, 10)).catch(console.error);
      fetchGroupBalances(parseInt(groupId, 10)).catch(console.error);
    }
  }, [groupId]);

  // Normalize data from either endpoint shape
  const planSteps = settlementPlan?.plan
    || settlementPlan?.settlements
    || settlementPlan?.transactions
    || (Array.isArray(settlementPlan) ? settlementPlan : []);

  const originalCount = groupBalances?.balances?.length
    || groupBalances?.netBalances?.length
    || (Array.isArray(groupBalances) ? groupBalances.length : 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Settlement Plan${group ? ` — ${group.name}` : ''}`}
        subtitle="The optimal set of transactions to fully settle all debts in this group with minimum payments."
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-800 bg-slate-900/50 text-slate-300 hover:text-white hover:border-slate-700 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <Link
              to={`/balances?groupId=${groupId}`}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Group Balances
            </Link>
          </div>
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

      {/* Info Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Optimal Debt Resolution</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            This plan uses a debt-minimization algorithm to calculate the fewest possible transactions needed to fully settle all balances in this group.
          </p>
        </div>
      </div>

      {/* Plan Steps */}
      {loading || loadingGroup ? (
        <div className="flex flex-col gap-3 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-900 rounded-xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-100">Required Transactions</h2>
            <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              {planSteps.length} payment{planSteps.length !== 1 ? 's' : ''}
            </span>
          </div>

          <DebtSimplificationPanel
            simplifiedDebts={planSteps}
            originalCount={originalCount}
            groupId={parseInt(groupId, 10)}
            currentUserId={user?.id}
          />
        </div>
      )}

      {/* Footer tip */}
      {planSteps.length > 0 && (
        <div className="flex items-center gap-2 p-4 rounded-xl border border-emerald-500/15 bg-emerald-950/10">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-emerald-400/80">
            Once all {planSteps.length} payment{planSteps.length !== 1 ? 's' : ''} are made, the group will be fully settled. Use the <span className="font-semibold">Record a Settlement</span> button to log each payment.
          </p>
        </div>
      )}
    </div>
  );
};

export default SettlementPlan;
