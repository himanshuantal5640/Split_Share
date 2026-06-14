import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import { ActiveMembersTable, MembershipHistoryTable } from '../../components/groups/MembersTable';
import AddMemberModal from '../../components/groups/AddMemberModal';
import RemoveMemberModal from '../../components/groups/RemoveMemberModal';
import { getGroupDetails, removeGroupMember } from '../../api/groupApi';
import { useAuth } from '../../context/AuthContext';

const GroupDetails = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal control states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGroupDetails(parseInt(groupId, 10));
      setGroup(data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        'Failed to fetch group details. Check if this group exists.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setGroup(null);
    fetchDetails();
  }, [groupId]);

  const handleOpenRemoveModal = (member) => {
    setMemberToRemove(member);
    setIsRemoveOpen(true);
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeGroupMember(parseInt(groupId, 10), userId);
      await fetchDetails();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  if (loading && !group) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-900 rounded-lg w-[40%] mb-4"></div>
        <div className="h-[200px] bg-slate-900 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-950/20 text-red-400 text-sm leading-relaxed max-w-2xl flex flex-col gap-4">
        <span>{error}</span>
        <Link to="/groups" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline">
          Back to Groups
        </Link>
      </div>
    );
  }

  if (!group) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <PageHeader
        title={group.name}
        subtitle={group.description || 'No description provided.'}
        actions={
          <div className="flex gap-3">
            <Link
              to="/groups"
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              Back to Groups
            </Link>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4.5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow shadow-indigo-500/10 cursor-pointer"
            >
              Add Member
            </button>
          </div>
        }
      />

      {/* Details Sections */}
      <div className="flex flex-col gap-8">
        {/* Active Members Table */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Active Members
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {group.activeMembers?.length || 0}
            </span>
          </h3>
          <ActiveMembersTable
            members={group.activeMembers || []}
            onRemoveClick={handleOpenRemoveModal}
            currentUserId={user?.id}
          />
        </div>

        {/* Historic Membership Logs */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Membership History Log
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
              {group.membershipHistory?.length || 0}
            </span>
          </h3>
          <MembershipHistoryTable history={group.membershipHistory || []} />
        </div>
      </div>

      {/* Modals Overlay portals */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={fetchDetails}
        groupId={group.id}
      />

      <RemoveMemberModal
        isOpen={isRemoveOpen}
        onClose={() => {
          setIsRemoveOpen(false);
          setMemberToRemove(null);
        }}
        onConfirm={handleRemoveMember}
        groupId={group.id}
        member={memberToRemove}
      />
    </div>
  );
};

export default GroupDetails;
