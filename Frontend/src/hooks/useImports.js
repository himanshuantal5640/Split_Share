import { useState, useCallback } from 'react';
import importApi from '../api/importApi';

export const useImports = () => {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await importApi.listImports();
      setImports(data);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load import history.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchImportDetails = useCallback(async (importId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await importApi.getImportDetails(importId);
      return data;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to retrieve import details.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadImport = useCallback(async (groupId, file, onProgress) => {
    setLoading(true);
    setError(null);
    try {
      const newImport = await importApi.uploadCsv(groupId, file, onProgress);
      setImports((prev) => [newImport, ...prev]);
      return newImport;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to complete CSV upload and parsing.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processImportJob = useCallback(async (importId) => {
    setLoading(true);
    setError(null);
    try {
      const report = await importApi.processImport(importId);
      return report;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to process import ledger.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    imports,
    loading,
    error,
    fetchImports,
    fetchImportDetails,
    uploadImport,
    processImportJob,
  };
};

export default useImports;
