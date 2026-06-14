import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout action
  const logout = () => {
    localStorage.removeItem('spit_expense_token');
    localStorage.removeItem('spit_expense_user');
    setToken(null);
    setUser(null);
    console.log('User logged out successfully.');
  };

  // Helper to fetch current user profile from the server
  const getCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        const userData = res.data.data.user;
        setUser(userData);
        localStorage.setItem('spit_expense_user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Clean up session if backend returns unauthorized (e.g. token expired)
      if (error.response && error.response.status === 401) {
        logout();
      }
      throw error;
    }
  };

  // Load user credentials from localStorage and restore session on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('spit_expense_token');
        const storedUser = localStorage.getItem('spit_expense_user');

        if (storedToken) {
          setToken(storedToken);
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          // Fetch fresh user data from API to confirm session is valid
          await getCurrentUser();
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login action
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { user: userData, token: userToken } = res.data.data;

        localStorage.setItem('spit_expense_token', userToken);
        localStorage.setItem('spit_expense_user', JSON.stringify(userData));

        setToken(userToken);
        setUser(userData);
        return { success: true, user: userData };
      }
    } catch (error) {
      console.error('Login action error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register action
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data && res.data.success) {
        // Automatically sign in the user after a successful signup
        return await login(email, password);
      }
    } catch (error) {
      console.error('Registration action error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    register,
    getCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
