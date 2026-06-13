import api from './axios';

/**
 * Get import processing summary report.
 * Returns: { importId, summary, anomalies, resolutions, processedRecords }
 */
export const getImportReport = async (importId) => {
  const res = await api.get(`/reports/import/${importId}`);
  return res.data.data.report;
};

/**
 * Get row-level audit trail for an import.
 * Returns: { sourceImport, rows[] }
 */
export const getAuditTrail = async (importId) => {
  const res = await api.get(`/reports/audit/${importId}`);
  return res.data.data.auditTrail;
};

/**
 * Get system-wide aggregate statistics.
 * Returns: { users, groups, expenses, settlements, imports, anomalies }
 */
export const getSystemStats = async () => {
  const res = await api.get('/reports/stats');
  return res.data.data.stats;
};

/**
 * Get system readiness status (public endpoint).
 * Returns: { ready, timestamp, checks: { database, environment, uploadsFolder } }
 */
export const getSystemReadiness = async () => {
  const res = await api.get('/system/readiness');
  return res.data.data;
};

/**
 * Get detailed system component health.
 * Returns: { healthy, timestamp, status: { database, importEngine, balanceEngine, currencyEngine } }
 */
export const getSystemHealth = async () => {
  const res = await api.get('/system/health');
  return res.data.data;
};

export default {
  getImportReport,
  getAuditTrail,
  getSystemStats,
  getSystemReadiness,
  getSystemHealth,
};
