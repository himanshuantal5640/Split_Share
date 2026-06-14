import * as authService from '../services/auth.service.js';

// Helper to wrap async route handlers and forward exceptions to Express error handler
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Register controller.
 */
export const register = catchAsync(async (req, res) => {
  const { email, password, name, avatarUrl } = req.body;
  const user = await authService.register({ email, password, name, avatarUrl });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user }
  });
});

/**
 * Login controller.
 */
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token }
  });
});

/**
 * Current user profile controller.
 */
export const me = catchAsync(async (req, res) => {
  const user = await authService.getUserProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: { user }
  });
});

/**
 * Search users.
 */
export const search = catchAsync(async (req, res) => {
  const query = req.query.q || '';
  const users = await authService.searchUsers(query, req.user.id);

  res.status(200).json({
    success: true,
    data: { users }
  });
});

/**
 * Update user profile controller.
 */
export const updateProfile = catchAsync(async (req, res) => {
  const updatedUser = await authService.updateUserProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});

export default {
  register,
  login,
  me,
  search,
  updateProfile
};
