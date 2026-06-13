import api from './axios';

/**
 * Trigger anomaly analysis on a parsed CSV import.
 * @param {number|string} importId
 */
export const analyzeImport = async (importId) => {
  const res = await api.post(`/imports/${importId}/analyze`);
  return res.data.data.report;
};

/**
 * List all anomalies detected for a specific import job.
 * @param {number|string} importId
 */
export const getImportAnomalies = async (importId) => {
  const res = await api.get(`/imports/${importId}/anomalies`);
  return res.data.data.anomalies;
};

/**
 * Get detailed information about a single anomaly.
 * @param {number|string} anomalyId
 */
export const getAnomaly = async (anomalyId) => {
  const res = await api.get(`/anomalies/${anomalyId}`);
  return res.data.data.anomaly;
};

/**
 * List all pending anomalies across groups where the current user is active.
 */
export const getPendingAnomalies = async () => {
  const res = await api.get('/anomalies/pending');
  return res.data.data.anomalies;
};

/**
 * Approve a pending anomaly with a resolution note.
 * @param {number|string} anomalyId
 * @param {string} resolutionNote
 */
export const approveAnomaly = async (anomalyId, resolutionNote) => {
  const res = await api.patch(`/anomalies/${anomalyId}/approve`, { resolutionNote });
  return res.data.data.anomaly;
};

/**
 * Reject a pending anomaly with a resolution note.
 * @param {number|string} anomalyId
 * @param {string} resolutionNote
 */
export const rejectAnomaly = async (anomalyId, resolutionNote) => {
  const res = await api.patch(`/anomalies/${anomalyId}/reject`, { resolutionNote });
  return res.data.data.anomaly;
};

/**
 * Fetch the resolution report for a specific import.
 * @param {number|string} importId
 */
export const getResolutionReport = async (importId) => {
  const res = await api.get(`/imports/${importId}/resolution-report`);
  return res.data.data.report;
};

export default {
  analyzeImport,
  getImportAnomalies,
  getAnomaly,
  getPendingAnomalies,
  approveAnomaly,
  rejectAnomaly,
  getResolutionReport,
};
