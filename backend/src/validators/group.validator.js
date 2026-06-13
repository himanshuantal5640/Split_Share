/**
 * Validates group creation body.
 * @param {object} body - Request body containing name, description
 * @returns {object} { isValid, errors }
 */
export const validateCreateGroup = (body) => {
  const errors = {};
  const { name, description } = body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 3) {
    errors.name = 'Group name must be at least 3 characters long.';
  }

  if (description && typeof description !== 'string') {
    errors.description = 'Description must be a string.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validates adding a member body.
 * @param {object} body - Request body containing userId
 * @returns {object} { isValid, errors }
 */
export const validateAddMember = (body) => {
  const errors = {};
  const { userId } = body || {};

  const idNum = parseInt(userId, 10);
  if (isNaN(idNum) || idNum <= 0) {
    errors.userId = 'Please provide a valid user ID.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateCreateGroup,
  validateAddMember
};
