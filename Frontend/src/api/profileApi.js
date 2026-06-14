import api from './axios';

/**
 * Update current user profile (name, email, avatarUrl, currentPassword, newPassword).
 */
export const updateProfile = async (profileData) => {
  const res = await api.put('/auth/profile', profileData);
  return res.data.data.user;
};

export default {
  updateProfile,
};
