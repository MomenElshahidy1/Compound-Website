import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Set to true to include credentials in cross-origin requests
});

// Create a separate instance for multipart/form-data requests
const formDataApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  withCredentials: true,
});

// Add token to formDataApi requests
formDataApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

// Posts services
export const postsService = {
  getPosts: () => api.get('/posts'),
  createPost: (postData) => api.post('/posts', postData),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

// Admin services
export const adminService = {
  getPendingUsers: () => api.get('/admin/pending-users'),
  approveUser: (userId) => api.post(`/admin/users/${userId}/approve`),
  rejectUser: (userId) => api.post(`/admin/users/${userId}/reject`),
  banUser: (userId) => api.post(`/admin/users/${userId}/ban`),
  unbanUser: (userId) => api.post(`/admin/users/${userId}/unban`),
  deletePost: (postId) => api.post(`/admin/posts/${postId}/delete`),
  deleteAdvertisement: (adId) => api.post(`/admin/advertisements/${adId}/delete`),
  getAllUsers: () => api.get('/admin/users'),
};

// Messages services
export const messagesService = {
  getMessages: () => api.get('/messages'),
  messageAdmin: (messageData) => api.post('/messages/admin', messageData),
  deleteMessage: (senderId, recipientId, messageId) => api.delete(`/messages/${senderId}/${recipientId}/${messageId}`),
  markAsRead: (messageId) => api.post(`/messages/${messageId}/read`),
  replyToUser: (userId, messageData) => api.post(`/messages/reply/${userId}`, messageData),
};

// Public services
export const publicServicesService = {
  getPublicServices: () => api.get('/public-services'),
  getPublicServiceCategories: () => api.get('/public-services/categories'),
  createPublicServiceCategory: (categoryData) => api.post('/public-services/categories', categoryData),
  updatePublicServiceCategory: (categoryId, categoryData) => api.put(`/public-services/categories/${categoryId}`, categoryData),
  deletePublicServiceCategory: (categoryId) => api.delete(`/public-services/categories/${categoryId}`),
  createPublicService: (serviceData) => api.post('/public-services', serviceData),
  updatePublicService: (serviceId, serviceData) => api.put(`/public-services/${serviceId}`, serviceData),
  deletePublicService: (serviceId) => api.delete(`/public-services/${serviceId}`),
  
};

// Advertisements services
export const advertisementsService = {
  getAdvertisements: () => api.get('/advertisements'),
  createAdvertisement: (adData) => api.post('/advertisements', adData),
  createAdvertisementWithImages: (formData) => formDataApi.post('/advertisements', formData),
  updateAdvertisement: (adId, adData) => api.put(`/advertisements/${adId}`, adData),
  updateAdvertisementWithImages: (adId, formData) => formDataApi.put(`/advertisements/${adId}`, formData),
  deleteAdvertisement: (adId) => api.delete(`/advertisements/${adId}`),
};

export default api;
