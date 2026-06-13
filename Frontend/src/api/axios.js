import axios from 'axios';

// Create pre-configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach JWT token to outgoing requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spit_expense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (like 401s)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, we can optionally trigger logout or redirect
    if (error.response && error.response.status === 401) {
      // Clear token to prevent stuck expired auth states
      localStorage.removeItem('spit_expense_token');
      localStorage.removeItem('spit_expense_user');
    }
    return Promise.reject(error);
  }
);

export default api;
