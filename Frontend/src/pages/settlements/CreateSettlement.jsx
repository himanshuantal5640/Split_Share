import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import SettlementForm from '../../components/settlements/SettlementForm';
import { listGroups } from '../../api/groupApi';
import { useSettlements } from '../../hooks/useSettlements';

const CreateSettlement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryGroupId = searchParams.get('groupId');

  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const { addSettlement, loading, error } = useSettlements();

  // Fetch groups to populate form selector options
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await listGroups();
        setGroups(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const handleCreateSettlement = async (settlementData) => {
    try {
      await addSettlement(settlementData);
      navigate(`/settlements?groupId=${settlementData.groupId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Record Settlement"
        subtitle="Log a repayment sent from one group member directly to another."
      />

      {loadingGroups ? (
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/20 animate-pulse h-[300px]"></div>
      ) : (
        <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur shadow-xl">
          <SettlementForm
            onSubmit={handleCreateSettlement}
            groups={groups}
            initialGroupId={queryGroupId || ''}
            loading={loading}
            error={error}
          />
        </div>
      )}
    </div>
  );
};

export default CreateSettlement;
