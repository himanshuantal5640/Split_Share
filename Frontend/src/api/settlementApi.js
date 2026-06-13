import api from './axios';

/**
 * List all settlements for a group.
 */
export const listGroupSettlements = async (groupId) => {
  const res = await api.get(`/settlements/group/${groupId}`);
  return res.data.data.settlements;
};

/**
 * Get detailed settlement.
 */
export const getSettlementDetails = async (settlementId) => {
  const res = await api.get(`/settlements/${settlementId}`);
  return res.data.data.settlement;
};

/**
 * Create a new settlement.
 */
export const createSettlement = async (settlementData) => {
  const res = await api.post('/settlements', settlementData);
  return res.data.data.settlement;
};

/**
 * Soft delete a settlement.
 */
export const deleteSettlement = async (settlementId) => {
  const res = await api.delete(`/settlements/${settlementId}`);
  return res.data;
};

export default {
  listGroupSettlements,
  getSettlementDetails,
  createSettlement,
  deleteSettlement,
};
