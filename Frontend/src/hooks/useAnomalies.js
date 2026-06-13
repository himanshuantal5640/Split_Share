import { useState, useCallback } from 'react';
import anomalyApi from '../api/anomalyApi';

export const useAnomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingAnomalies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await anomalyApi.getPendingAnomalies();
      setAnomalies(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load pending anomalies.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchImportAnomalies = useCallback(async (importId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await anomalyApi.getImportAnomalies(importId);
      setAnomalies(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load anomalies for this import.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnomalyDetails = useCallback(async (anomalyId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await anomalyApi.getAnomaly(anomalyId);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve anomaly details.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeImport = useCallback(async (importId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await anomalyApi.analyzeImport(importId);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze import anomalies.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAnomalyAction = useCallback(async (anomalyId, action, resolutionNote) => {
    setLoading(true);
    setError(null);
    try {
      let resolved;
      if (action === 'APPROVE') {
        resolved = await anomalyApi.approveAnomaly(anomalyId, resolutionNote);
      } else {
        resolved = await anomalyApi.rejectAnomaly(anomalyId, resolutionNote);
      }
      // Keep state in sync by filtering out the resolved anomaly
      setAnomalies((prev) => prev.filter((a) => a.id !== parseInt(anomalyId, 10)));
      return resolved;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit resolution.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResolutionReport = useCallback(async (importId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await anomalyApi.getResolutionReport(importId);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve resolution report.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    anomalies,
    loading,
    error,
    fetchPendingAnomalies,
    fetchImportAnomalies,
    fetchAnomalyDetails,
    analyzeImport,
    resolveAnomalyAction,
    fetchResolutionReport,
  };
};

export default useAnomalies;
