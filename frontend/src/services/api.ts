import axios from 'axios';

// baseURL ditambahkan prefix 
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Request
api.interceptors.request.use(
  (config) => {
    // Jika data adalah FormData, hapus Content-Type agar browser otomatis menyetel multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const token = isAdmin
      ? (localStorage.getItem('admin_token') || localStorage.getItem('token') || localStorage.getItem('access_token'))
      : (localStorage.getItem('citizen_token') || localStorage.getItem('token') || localStorage.getItem('access_token'));

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor Response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesi telah berakhir atau unauthorized. Silakan login kembali.');
    }
    return Promise.reject(error);
  }
);