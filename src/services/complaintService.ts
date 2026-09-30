import { api } from './api';
import type { Complaint } from '../types';

const mapComplaint = (c: any): Complaint => ({
  id: c.id,
  complaintNumber: c.complaint_number || c.complaintNumber,
  category: c.category,
  location: c.location,
  description: c.description,
  reporterId: c.reporter_id || c.reporterId,
  reporterName: c.reporter?.name || 'User',
  date: c.date || new Date().toISOString(),
  status: c.status,
  priority: c.priority
});

export const complaintService = {
  getComplaints: async (): Promise<Complaint[]> => {
    return api.get('/complaints').then(res => res.data.map(mapComplaint));
  },

  getComplaintById: async (id: string): Promise<Complaint> => {
    return api.get(`/complaints/${id}`).then(res => mapComplaint(res.data));
  },

  createComplaint: async (formData: FormData): Promise<Complaint> => {
    return api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => mapComplaint(res.data));
  },

  updateStatus: async (id: string, status: string, priority?: string): Promise<Complaint> => {
    return api.put(`/complaints/${id}/status`, { status, priority }).then(res => mapComplaint(res.data));
  }
};
