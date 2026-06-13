import api from './axios';

/**
 * List all groups user is member of.
 */
export const listGroups = async () => {
  const res = await api.get('/groups');
  return res.data.data.groups;
};

/**
 * Create a new group.
 */
export const createGroup = async (groupData) => {
  const res = await api.post('/groups', groupData);
  return res.data.data.group;
};

/**
 * Get group detailed profile (members and history).
 */
export const getGroupDetails = async (groupId) => {
  const res = await api.get(`/groups/${groupId}`);
  return res.data.data.group;
};

/**
 * Add a member to a group by user ID.
 */
export const addGroupMember = async (groupId, userId) => {
  const res = await api.post(`/groups/${groupId}/members`, { userId: parseInt(userId, 10) });
  return res.data.data.membership;
};

/**
 * Remove a member from a group (soft delete).
 */
export const removeGroupMember = async (groupId, userId) => {
  const res = await api.patch(`/groups/${groupId}/members/${userId}/remove`);
  return res.data.data.membership;
};

export default {
  listGroups,
  createGroup,
  getGroupDetails,
  addGroupMember,
  removeGroupMember,
};
