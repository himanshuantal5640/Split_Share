import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Sign a new JWT token
 * @param {object} payload - Payload to embed in the token
 * @param {string} [expiresIn] - Optional override for token lifespan
 * @returns {string} Signed JWT token
 */
export const signToken = (payload, expiresIn = env.jwtExpiresIn) => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If verification fails
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

export default {
  signToken,
  verifyToken
};
