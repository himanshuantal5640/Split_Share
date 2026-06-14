import api from './axios';

/**
 * Upload a CSV file associated with a group circle.
 * @param {number|string} groupId - Target group ID
 * @param {File} file - CSV file
 * @param {Function} onUploadProgress - Progress callback handler
 */
export const uploadCsv = async (groupId, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('groupId', groupId);
  formData.append('file', file);

  const res = await api.post('/imports/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
  return res.data.data.import;
};

/**
 * List user's historical imports.
 */
export const listImports = async () => {
  const res = await api.get('/imports');
  return res.data.data.imports;
};

/**
 * Get detailed CSV rows for a specific import job.
 * @param {number|string} importId - Target import ID
 */
export const getImportDetails = async (importId) => {
  const res = await api.get(`/imports/${importId}`);
  return res.data.data.import;
};

/**
 * Process all approved rows of an import to generate expenses/settlements.
 */
export const processImport = async (importId) => {
  const res = await api.post(`/imports/${importId}/process`);
  return res.data.data.report;
};

/**
 * Get import processing status.
 */
export const getProcessingStatus = async (importId) => {
  const res = await api.get(`/imports/${importId}/status`);
  return res.data.data.status;
};

/**
 * Get detailed import processing report.
 */
export const getProcessingReport = async (importId) => {
  const res = await api.get(`/imports/${importId}/process-report`);
  return res.data.data.report;
};

export default {
  uploadCsv,
  listImports,
  getImportDetails,
  processImport,
  getProcessingStatus,
  getProcessingReport,
};
