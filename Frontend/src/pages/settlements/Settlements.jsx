import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import SettlementTable from '../../components/settlements/SettlementTable';
import DeleteSettlementModal from '../../components/settlements/DeleteSettlementModal';
import { listGroups } from '../../api/groupApi';
import { useSettlements } from '../../hooks/useSettlements';
import { useAuth } from '../../context/AuthContext';

const Settlements = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(queryGroupId || '');
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groupError, setGroupError] = useState(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const {
    settlements,
    loading: loadingSettlements,
    error: settlementError,
    fetchGroupSettlements,
    removeSettlement,
  } = useSettlements();

  // Load user groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await listGroups();
        setGroups(data);
        if (data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data[0].id.toString());
          setSearchParams({ groupId: data[0].id.toString() });
        }
      } catch (err) {
        console.error(err);
        setGroupError('Failed to fetch group circles.');
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  // Fetch settlements when group selection changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupSettlements(parseInt(selectedGroupId, 10)).catch((err) => {
        console.error('Failed to load settlements:', err);
      });
    }
  }, [selectedGroupId, fetchGroupSettlements]);

  const handleGroupChange = (e) => {
    const val = e.target.value;
    setSelectedGroupId(val);
    if (val) {
      setSearchParams({ groupId: val });
    } else {
      setSearchParams({});
    }
  };

  const handleDeleteClick = (settlementId) => {
    const target = settlements.find((s) => s.id === settlementId);
    if (target) {
      setSelectedSettlement(target);
      setModalOpen(true);
    }
  };

  const handleConfirmDelete = async (settlementId) => {
    await removeSettlement(settlementId);
  };

  const error = groupError || settlementError;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settlements Ledger"
        subtitle="Track repayments and record payments sent between circle members."
        actions={
          selectedGroupId && (
            <Link
              to={`/settlements/create?groupId=${selectedGroupId}`}
              className="px-5 py-3 rounded-xl font-medium bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Record Settlement
            </Link>
          )
        }
      />

      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed flex items-start gap-2.5 max-w-2xl">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Group Selector Dropdown */}
      <div className="max-w-xs flex flex-col gap-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Group Circle</label>
        <select
          value={selectedGroupId}
          onChange={handleGroupChange}
          disabled={loadingGroups}
          className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="">-- Choose Group --</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Settlements Table or Empty View */}
      {loadingSettlements ? (
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="h-12 bg-slate-900 rounded-xl w-full"></div>
          <div className="h-[250px] bg-slate-900 rounded-xl"></div>
        </div>
      ) : !selectedGroupId ? (
        <div className="min-h-[35vh] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-3">
          <span className="text-2xl">📁</span>
          <h3 className="text-base font-bold text-slate-200">No Circle Selected</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Please choose a group circle from the selector above to load settlement details.
          </p>
        </div>
      ) : settlements.length === 0 ? (
        <div className="min-h-[35vh] flex flex-col items-center justify-center text-center p-8 rounded-2xl border border-slate-900 bg-slate-950/20 gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl font-bold">
            🤝
          </div>
          <h3 className="text-base font-bold text-slate-200">No Recorded Settlements</h3>
          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            No active repayment settlement entries exist for this group. Click the button above to record your first settlement.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <SettlementTable
            settlements={settlements}
            onDeleteClick={handleDeleteClick}
            currentUserId={user?.id}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteSettlementModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedSettlement(null);
        }}
        onConfirm={handleConfirmDelete}
        settlement={selectedSettlement}
      />
    </div>
  );
};

export default Settlements;
