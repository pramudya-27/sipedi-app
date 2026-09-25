// import { api } from './api';
import type { Complaint } from '../types';
import { mockComplaints } from '../data/mockComplaints';

export const complaintService = {
  getComplaints: async (): Promise<Complaint[]> => {
    // return api.get('/complaints').then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockComplaints), 500);
    });
  },

  getComplaintById: async (id: string): Promise<Complaint | undefined> => {
    // return api.get(`/complaints/${id}`).then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockComplaints.find(c => c.id === id)), 500);
    });
  },

  createComplaint: async (data: Partial<Complaint>): Promise<Complaint> => {
    // return api.post('/complaints', data).then(res => res.data);
    return new Promise((resolve) => {
      const newComplaint = {
        ...data,
        id: `c${Date.now()}`,
        complaintNumber: `ADU-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        status: 'Baru' as const,
        date: new Date().toISOString()
      } as Complaint;
      setTimeout(() => resolve(newComplaint), 1000);
    });
  }
};
