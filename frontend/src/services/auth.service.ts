import api from './api';
import { LoginFormData } from '../schemas/auth.schema';

export const authService = {
  login: async (credentials: LoginFormData) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  refresh: async () => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  validate: async () => {
    const response = await api.get('/api/auth/validate');
    return response.data;
  },
};
