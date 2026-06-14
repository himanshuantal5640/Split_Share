import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import GroupForm from '../../components/groups/GroupForm';
import { createGroup } from '../../api/groupApi';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreateGroup = async (groupData) => {
    setLoading(true);
    setError(null);
    try {
      const group = await createGroup({
        name: groupData.name,
        description: groupData.description,
        memberIds: groupData.memberIds
      });
      
      // Navigate to the details page of the newly created group circle
      navigate(`/groups/${group.id}`);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to construct group circle. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Create Group Circle"
        subtitle="Establish a new ledger group to manage split shares and cash balances."
      />

      <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/40 backdrop-blur-md shadow-xl">
        <GroupForm
          onSubmit={handleCreateGroup}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  );
};

export default CreateGroup;
