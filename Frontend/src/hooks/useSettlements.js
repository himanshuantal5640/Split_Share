import { useState, useCallback } from 'react';
import settlementApi from '../api/settlementApi';

export const useSettlements = () => {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroupSettlements = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await settlementApi.listGroupSettlements(groupId);
      setSettlements(data);
      return data;
    } catch (err) {
      console.error(err);
      setError('Failed to load group settlements.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addSettlement = useCallback(async (settlementData) => {
    setLoading(true);
    setError(null);
    try {
      const newSettlement = await settlementApi.createSettlement(settlementData);
      setSettlements((prev) => [newSettlement, ...prev]);
      return newSettlement;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to record settlement.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeSettlement = useCallback(async (settlementId) => {
    setLoading(true);
    setError(null);
    try {
      await settlementApi.deleteSettlement(settlementId);
      setSettlements((prev) => prev.filter((s) => s.id !== settlementId));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete settlement.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    settlements,
    loading,
    error,
    fetchGroupSettlements,
    addSettlement,
    removeSettlement,
  };
};

export default useSettlements;
