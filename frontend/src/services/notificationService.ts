import { api } from './api';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'PERMIT_STATUS' | 'NEW_COMPLAINT' | 'SYSTEM_INFO';
  link_url?: string;
  is_read: number;
  created_at: string;
}


const ENDPOINT = '/v1/notifications';

export default {
  // 1. Ambil daftar notifikasi
  getNotifications: async (): Promise<NotificationItem[]> => {
    try {
      const response = await api.get(ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Gagal mengambil notifikasi:', error);
      return [];
    }
  },

  // 2. Tandai SEMUA notifikasi 
  markAllAsRead: async (): Promise<boolean> => {
    try {
      await api.put(`${ENDPOINT}/mark-all-read`);
      return true;
    } catch (error) {
      console.error('Gagal memperbarui semua status notifikasi:', error);
      return false;
    }
  },

  // 3. Tandai SATU notifikasi 
  markAsRead: async (id: string): Promise<boolean> => {
    try {
      await api.put(`${ENDPOINT}/${id}/read`);
      return true;
    } catch (error) {
      console.error(`Gagal memperbarui status notifikasi ID ${id}:`, error);
      return false;
    }
  }
};