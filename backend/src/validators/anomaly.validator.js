/**
 * Validates request parameters for anomaly endpoints.
 * @param {object} params - Request params containing importId or anomalyId
 * @returns {object} { isValid, errors }
 */
export const validateAnalyzeRequest = (params) => {
  const errors = {};
  const importId = parseInt(params.importId, 10);

  if (isNaN(importId) || importId <= 0) {
    errors.importId = 'Please provide a valid import ID.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateAnalyzeRequest
};
