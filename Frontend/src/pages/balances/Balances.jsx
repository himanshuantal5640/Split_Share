import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import BalanceCard from '../../components/balances/BalanceCard';
import BalanceTable from '../../components/balances/BalanceTable';
import DebtSimplificationPanel from '../../components/balances/DebtSimplificationPanel';
import RecommendationsPanel from '../../components/balances/RecommendationsPanel';
import { listGroups } from '../../api/groupApi';
import { useBalances } from '../../hooks/useBalances';
import { useAuth } from '../../context/AuthContext';

const TAB_BALANCES = 'balances';
const TAB_SIMPLIFIED = 'simplified';
const TAB_RECOMMENDATIONS = 'recommendations';

const Balances = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(queryGroupId || '');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupError, setGroupError] = useState(null);
  const [activeTab, setActiveTab] = useState(TAB_BALANCES);
  const activeGroup = groups.find(g => g.id.toString() === selectedGroupId);

  const {
    groupBalances,
    simplifiedBalances,
    recommendations,
    loading,
    error,
    fetchGroupBalances,
    fetchSimplifiedBalances,
    fetchRecommendations,
  } = useBalances();

  // Load user groups
  useEffect(() => {
    const load = async () => {
      try {
        const data = await listGroups();
        setGroups(data);
        if (data.length > 0 && !selectedGroupId) {
          const firstId = data[0].id.toString();
          setSelectedGroupId(firstId);
          setSearchParams({ groupId: firstId });
        }
      } catch (err) {
        console.error(err);
        setGroupError('Failed to load groups.');
      } finally {
        setLoadingGroups(false);
      }
    };
    load();
  }, []);

  // Load data when group changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupBalances(parseInt(selectedGroupId, 10)).catch(console.error);
      fetchSimplifiedBalances(parseInt(selectedGroupId, 10)).catch(console.error);
    }
  }, [selectedGroupId]);

  // Load recommendations when user is available
  useEffect(() => {
    if (user?.id) {
      fetchRecommendations(user.id).catch(console.error);
    }
  }, [user?.id]);

  const handleGroupChange = (e) => {
    const val = e.target.value;
    setSelectedGroupId(val);
    if (val) setSearchParams({ groupId: val });
    else setSearchParams({});
  };

  // Compute summary stats from groupBalances
  const computeSummary = () => {
    const balanceList = groupBalances?.balances || groupBalances?.netBalances || (Array.isArray(groupBalances) ? groupBalances : []);
    if (!Array.isArray(balanceList) || !user?.id) return { totalOwed: 0, totalOwe: 0, net: 0 };

    const currentUserBalance = balanceList.find((b) => b.userId === user.id);
    if (!currentUserBalance) return { totalOwed: 0, totalOwe: 0, net: 0 };

    const netVal = parseFloat(currentUserBalance.netBalance) || 0;
    const totalOwed = netVal > 0 ? netVal : 0;
    const totalOwe = netVal < 0 ? Math.abs(netVal) : 0;

    return { totalOwed, totalOwe, net: netVal };
  };

  const { totalOwed, totalOwe, net } = computeSummary();

  const balanceList = groupBalances?.balances || groupBalances?.netBalances || (Array.isArray(groupBalances) ? groupBalances : []);
  const simplifiedList = simplifiedBalances?.simplified || simplifiedBalances?.simplifiedDebts || (Array.isArray(simplifiedBalances) ? simplifiedBalances : []);
  const recommendationList = recommendations?.recommendations || (Array.isArray(recommendations) ? recommendations : []);
  const originalCount = groupBalances?.totalTransactions || balanceList.length;

  const tabs = [
    { id: TAB_BALANCES, label: 'Group Balances', count: balanceList.length },
    { id: TAB_SIMPLIFIED, label: 'Simplified Debts', count: simplifiedList.length },
    { id: TAB_RECOMMENDATIONS, label: 'My Recommendations', count: recommendationList.length },
  ];

  const combinedError = groupError || error;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Balance Dashboard"
        subtitle={
          activeGroup
            ? `Balance analysis for group circle "${activeGroup.name}".`
            : "View net balances, simplified debt graphs, and smart settlement recommendations."
        }
        actions={
          selectedGroupId && (
            <Link
              to={`/balances/${selectedGroupId}/settlement-plan`}
              className="px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Settlement Plan
            </Link>
          )
        }
      />

      {/* Error */}
      {combinedError && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm flex items-start gap-2.5 max-w-2xl">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{combinedError}</span>
        </div>
      )}

      {/* Group Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="max-w-xs w-full flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Group Circle</label>
          <select
            value={selectedGroupId}
            onChange={handleGroupChange}
            disabled={loadingGroups}
            className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="">-- Choose Group --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>

        {selectedGroupId && activeGroup && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950/40 backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Circle: <span className="text-slate-100 font-bold normal-case">{activeGroup.name}</span>
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {selectedGroupId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BalanceCard
            label="You Are Owed"
            amount={totalOwed}
            currency={groupBalances?.currency || 'USD'}
            variant="owed"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            }
          />
          <BalanceCard
            label="You Owe"
            amount={totalOwe}
            currency={groupBalances?.currency || 'USD'}
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
            currency={groupBalances?.currency || 'USD'}
            variant="net"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            }
          />
        </div>
      )}

      {/* Tabs */}
      {selectedGroupId && (
        <>
          <div className="flex gap-1 border-b border-slate-900 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[280px]">
            {loading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-12 bg-slate-900 rounded-xl" />
                <div className="h-48 bg-slate-900 rounded-xl" />
              </div>
            ) : activeTab === TAB_BALANCES ? (
              <BalanceTable balances={balanceList} currentUserId={user?.id} currency={groupBalances?.currency || 'INR'} />
            ) : activeTab === TAB_SIMPLIFIED ? (
              <DebtSimplificationPanel
                simplifiedDebts={simplifiedList}
                originalCount={originalCount}
                groupId={parseInt(selectedGroupId, 10)}
                currentUserId={user?.id}
              />
            ) : (
              <RecommendationsPanel recommendations={recommendationList} loading={loading} />
            )}
          </div>
        </>
      )}

      {/* No Group Selected */}
      {!selectedGroupId && !loadingGroups && (
        <div className="min-h-[35vh] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-3">
          <span className="text-2xl">📊</span>
          <h3 className="text-base font-bold text-slate-200">No Circle Selected</h3>
          <p className="text-xs text-slate-400 max-w-xs">Choose a group circle from the selector above to load balance data.</p>
        </div>
      )}
    </div>
  );
};

export default Balances;
