import axios from 'axios';

// Use environment variable for API URL in production, or proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.data);
    
    // Extract error message from response (handle both 'error' and 'message' fields)
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed';
    
    // Only redirect on 401 if not on login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Create a new error with the extracted message
    const enhancedError = new Error(message);
    return Promise.reject(enhancedError);
  }
);
