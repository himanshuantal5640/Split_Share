import { useState, useCallback } from 'react';
import reportApi from '../api/reportApi';

export const useReports = () => {
  const [importReport, setImportReport] = useState(null);
  const [auditTrail, setAuditTrail] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImportReport = useCallback(async (importId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getImportReport(importId);
      setImportReport(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load import report.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAuditTrail = useCallback(async (importId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getAuditTrail(importId);
      setAuditTrail(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load audit trail.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSystemStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getSystemStats();
      setSystemStats(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load system statistics.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReadiness = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getSystemReadiness();
      setReadiness(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load readiness status.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportApi.getSystemHealth();
      setHealth(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load health status.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    importReport,
    auditTrail,
    systemStats,
    readiness,
    health,
    loading,
    error,
    fetchImportReport,
    fetchAuditTrail,
    fetchSystemStats,
    fetchReadiness,
    fetchHealth,
  };
};

export default useReports;
