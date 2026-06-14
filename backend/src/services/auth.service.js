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

/**
 * Search users by name or email.
 */
export const searchUsers = async (query = '', excludeUserId) => {
  return await prisma.user.findMany({
    where: {
      OR: query ? [
        { name: { contains: query } },
        { email: { contains: query } }
      ] : undefined,
      NOT: excludeUserId ? { id: excludeUserId } : undefined
    },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true
    },
    take: 20
  });
};

/**
 * Updates a user profile.
 */
export const updateUserProfile = async (userId, { name, email, avatarUrl, currentPassword, newPassword }) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('Email is already in use.', 400);
    }
    updateData.email = email;
  }
  if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

  if (newPassword) {
    if (!currentPassword) {
      throw new AppError('Current password is required to set a new password.', 400);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Incorrect current password.', 400);
    }
    const salt = await bcrypt.genSalt(10);
    updateData.passwordHash = await bcrypt.hash(newPassword, salt);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData
  });

  const { passwordHash: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export default {
  register,
  login,
  getUserProfile,
  searchUsers,
  updateUserProfile,
};
