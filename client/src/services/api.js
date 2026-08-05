import axios from 'axios';

/** Shared axios instance. Vite proxies /api to the Express server in dev. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jms.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = localStorage.getItem('jms.language') || 'en';
  config.headers['Accept-Language'] = lang;

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    // Normalise to a single shape so callers don't dig through axios internals
    const normalised = {
      status: error.response?.status ?? 0,
      message:
        error.response?.data?.message ||
        (error.code === 'ECONNABORTED' ? 'Request timed out' : 'Network error'),
      errors: error.response?.data?.errors || [],
    };
    return Promise.reject(normalised);
  }
);

export default api;
