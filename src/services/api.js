import axios from 'axios';
import { API_URL } from '../constants';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 ||error.response?.status === 403) {
      localStorage.clear();
      window.location = '/';
    }
    return Promise.reject(error);
  }
);