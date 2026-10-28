import axios from 'axios';

// Backend mounts all routers under /api prefix (see main.py lines 78-86)
// NEXT_PUBLIC_API_URL must include /api suffix (e.g. http://localhost:8000/api)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';


export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Alias for migration compatibility
export const apiClient = api;

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
       const token = localStorage.getItem("token")
       if (token) {
         config.headers.Authorization = `Bearer ${token}`
       }
    }
    return config
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401s elegantly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401) {
         console.warn("Unauthorized access - clearing token");
         localStorage.removeItem('token');
         localStorage.removeItem('role');
         // Also clear cookies so middleware reflects logout
         document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
         document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
         if (window.location.pathname !== '/auth/login' && window.location.pathname !== '/auth/register') {
           window.location.href = '/auth/login';
         }
      } else if (error.response?.status === 403) {
         console.error("Permission Denied (403)");
         alert("Access Denied: You do not have permission to perform this action.");
      } else if (!error.response) {
         console.error("Network Error - check your connection or backend server");
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token: string, role: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }
};

export const clearAuthToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      // Clear cookies so Next.js middleware knows user is logged out
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
};

export const getAuthToken = () => {
   if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
   }
   return null;
}

export default api;
