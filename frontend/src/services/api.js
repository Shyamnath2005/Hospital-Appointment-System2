import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('patient');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Doctors
export const doctorsAPI = {
  getAll: (params) => api.get('/doctors', { params }),
  getById: (id) => api.get(`/doctors/${id}`),
  getSpecialties: () => api.get('/doctors/specialties'),
  getSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
};

// Appointments
export const appointmentsAPI = {
  book: (data) => api.post('/appointments', data),
  getMy: (params) => api.get('/appointments/my', { params }),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

// Upload
export const uploadAPI = {
  upload: (formData) =>
    api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyDocuments: () => api.get('/upload/my-documents'),
  delete: (s3Key) => api.delete(`/upload/${encodeURIComponent(s3Key)}`),
};

export default api;
