import { useState, useCallback } from 'react';
import balanceApi from '../api/balanceApi';

export const useBalances = () => {
  const [groupBalances, setGroupBalances] = useState(null);
  const [userBalances, setUserBalances] = useState(null);
  const [userBreakdown, setUserBreakdown] = useState(null);
  const [simplifiedBalances, setSimplifiedBalances] = useState(null);
  const [settlementPlan, setSettlementPlan] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroupBalances = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.getGroupBalances(groupId);
      setGroupBalances(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load group balances.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserBalances = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.getUserBalances(userId);
      setUserBalances(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load user balances.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserBreakdown = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.getUserBalanceBreakdown(userId);
      setUserBreakdown(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load balance breakdown.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSimplifiedBalances = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.getSimplifiedBalances(groupId);
      setSimplifiedBalances(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load simplified balances.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSettlementPlan = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.getGroupSettlementPlan(groupId);
      setSettlementPlan(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load settlement plan.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecommendations = useCallback(async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.getUserRecommendations(userId);
      setRecommendations(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load recommendations.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    groupBalances,
    userBalances,
    userBreakdown,
    simplifiedBalances,
    settlementPlan,
    recommendations,
    loading,
    error,
    fetchGroupBalances,
    fetchUserBalances,
    fetchUserBreakdown,
    fetchSimplifiedBalances,
    fetchSettlementPlan,
    fetchRecommendations,
  };
};

export default useBalances;
