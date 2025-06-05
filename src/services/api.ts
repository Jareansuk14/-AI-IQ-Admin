import axios from 'axios';

// ตั้งค่า API URL ตาม environment
const getApiBaseUrl = () => {
  // ถ้ามี environment variable ให้ใช้
  if (process.env.REACT_APP_API_URL) {
    console.log('Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // ตรวจสอบว่าเป็น Vercel deployment หรือไม่
  if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('ai-iq-admin')) {
    console.log('Detected Vercel deployment, using production API');
    return 'https://ai-iq-server.onrender.com/api';
  }
  
  // ถ้าเป็น production build แต่ไม่ได้ deploy บน vercel
  if (process.env.NODE_ENV === 'production') {
    console.log('Production build detected, using production API');
    return 'https://ai-iq-server.onrender.com/api';
  }
  
  // ถ้าเป็น development ให้ใช้ proxy
  console.log('Development mode, using proxy');
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('Final API Base URL:', API_BASE_URL); // Debug log

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 