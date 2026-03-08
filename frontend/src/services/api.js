import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('streetbite_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('streetbite_token');
      localStorage.removeItem('streetbite_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/profile');

// Vendors
export const getVendors = (params) => api.get('/vendors', { params });
export const getVendorById = (id, params) => api.get(`/vendors/${id}`, { params });
export const createVendor = (data) => api.post('/vendors', data);
export const getTrendingVendors = () => api.get('/vendors/trending');
export const getUserVendors = () => api.get('/vendors/mine');

// Menu
export const getMenu = (vendorId) => api.get(`/menu/${vendorId}`);
export const addMenuItem = (data) => api.post('/menu', data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);

// Reviews
export const getReviews = (vendorId) => api.get(`/reviews/${vendorId}`);
export const addReview = (data) => api.post('/reviews', data);
export const getUserReviews = () => api.get('/reviews/mine');

// Upload
export const uploadPhoto = (formData) =>
  api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadMenuImage = (formData) =>
  api.post('/upload/menu-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export default api;
