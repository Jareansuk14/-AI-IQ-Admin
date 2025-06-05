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
  
  // ถ้าเป็น localhost ให้ใช้ development server
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Development mode, using localhost');
    return 'http://localhost:5000/api';
  }
  
  // Default to production API
  console.log('Default to production API');
  return 'https://ai-iq-server.onrender.com/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('Final API Base URL:', API_BASE_URL); // Debug log
console.log('Window location:', window.location.hostname); // Debug hostname

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // ปิด credentials เพื่อหลีกเลี่ยงปัญหา CORS
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