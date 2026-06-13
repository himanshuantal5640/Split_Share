import api from './axios';

/**
 * Get all balances for a specific group.
 * Returns net balances per member pair within the group.
 */
export const getGroupBalances = async (groupId) => {
  const res = await api.get(`/balances/group/${groupId}`);
  return res.data.data;
};

/**
 * Get personal balance summary for a specific user.
 * Returns what the user owes and is owed overall.
 */
export const getUserBalances = async (userId) => {
  const res = await api.get(`/balances/user/${userId}`);
  return res.data.data;
};

/**
 * Get detailed per-group breakdown of a user's balances.
 */
export const getUserBalanceBreakdown = async (userId) => {
  const res = await api.get(`/balances/user/${userId}/breakdown`);
  return res.data.data;
};

/**
 * Get simplified (debt-minimized) balances for a group.
 * Returns the minimal set of transactions to settle all debts.
 */
export const getSimplifiedBalances = async (groupId) => {
  const res = await api.get(`/balances/simplified/${groupId}`);
  return res.data.data;
};

/**
 * Get the full settlement plan for a group (optimal debt resolution).
 */
export const getGroupSettlementPlan = async (groupId) => {
  const res = await api.get(`/groups/${groupId}/settlement-plan`);
  return res.data.data;
};

/**
 * Get smart settlement recommendations for a user.
 */
export const getUserRecommendations = async (userId) => {
  const res = await api.get(`/balances/user/${userId}/recommendations`);
  return res.data.data;
};

export default {
  getGroupBalances,
  getUserBalances,
  getUserBalanceBreakdown,
  getSimplifiedBalances,
  getGroupSettlementPlan,
  getUserRecommendations,
};
