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

  // Load user credentials from localStorage on startup
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('spit_expense_token');
        const storedUser = localStorage.getItem('spit_expense_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        localStorage.removeItem('spit_expense_token');
        localStorage.removeItem('spit_expense_user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login action skeleton
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Mock login validation / endpoint simulation
      // In subsequent phases, this will hit: const res = await api.post('/auth/login', { email, password });
      console.log('Logging in user:', email);
      
      const mockUser = { id: 1, email, name: email.split('@')[0] };
      const mockToken = 'mock_jwt_token_' + Date.now();

      localStorage.setItem('spit_expense_token', mockToken);
      localStorage.setItem('spit_expense_user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      console.error('Login action error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register action skeleton
  const register = async (name, email, password) => {
    setLoading(true);
    try {
      // Mock registration
      // In subsequent phases, this will hit: const res = await api.post('/auth/register', { name, email, password });
      console.log('Registering user:', name, email);
      
      const mockUser = { id: 1, email, name };
      const mockToken = 'mock_jwt_token_' + Date.now();

      localStorage.setItem('spit_expense_token', mockToken);
      localStorage.setItem('spit_expense_user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      console.error('Registration action error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('spit_expense_token');
    localStorage.removeItem('spit_expense_user');
    setToken(null);
    setUser(null);
    console.log('User logged out successfully.');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
