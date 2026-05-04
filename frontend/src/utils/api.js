import axios from 'axios';
import { store } from '../store.js';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', // Adjust in production
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const { auth: { userInfo } } = store.getState();
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
