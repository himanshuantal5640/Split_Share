/**
 * Validates anomaly resolution request body.
 * @param {object} body - Request body containing resolution parameters
 * @returns {object} { isValid, errors }
 */
export const validateResolveAnomaly = (body) => {
  const errors = {};
  const { resolutionNote } = body || {};

  if (!resolutionNote || typeof resolutionNote !== 'string' || resolutionNote.trim().length < 3) {
    errors.resolutionNote = 'Resolution note is required and must be at least 3 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateResolveAnomaly
};
