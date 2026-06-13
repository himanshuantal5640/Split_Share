import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/errors.js';

/**
 * Registers a new user.
 * @param {object} payload - email, password, name, avatarUrl
 * @returns {object} The created user profile
 */
export const register = async ({ email, password, name, avatarUrl }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError('Email is already registered.', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Save user in DB
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      avatarUrl
    }
  });

  // Exclude password hash from the returned user object
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Log in a user.
 * @param {object} payload - email, password
 * @returns {object} { user, token }
 */
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Sign token
  const token = signToken({ id: user.id, email: user.email });

  const { passwordHash: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token
  };
};

/**
 * Retrieve user profile details.
 * @param {number} userId - The user's ID
 * @returns {object} The user profile
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
export default {
  register,
  login,
  getUserProfile
};
