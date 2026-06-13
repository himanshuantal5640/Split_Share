/**
 * Helper to validate registration fields.
 * @param {object} body - Request body containing email, password, name
 * @returns {object} { isValid, errors }
 */
export const validateRegister = (body) => {
  const errors = {};
  const { email, password, name } = body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Helper to validate login credentials.
 * @param {object} body - Request body containing email, password
 * @returns {object} { isValid, errors }
 */
export const validateLogin = (body) => {
  const errors = {};
  const { email, password } = body || {};

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
export default {
  validateRegister,
  validateLogin
};
