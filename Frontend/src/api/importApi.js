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

export default {
  uploadCsv,
  listImports,
  getImportDetails,
};
