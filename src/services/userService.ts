import { api } from './api';
import type { User } from '../types';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  updateUserRole: async (userId: string, role: 'CITIZEN' | 'ADMIN' | 'OFFICER'): Promise<User> => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  }
};
