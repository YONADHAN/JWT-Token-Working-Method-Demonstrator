

import axios from 'axios';
import { toast } from 'sonner';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Interceptors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axiosInstance.get('/refresh_token');
        toast.success('Token refreshed');
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        toast.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else {
      toast.error('An error occurred');
    }

    return Promise.reject(error);
  }
);

export { axiosInstance };
