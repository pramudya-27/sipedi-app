import { api } from './api';
import type { Complaint, ComplaintEvidence } from '../types';

const mapEvidence = (e: any): ComplaintEvidence => ({
  id: e.id,
  filePath: e.file_path || e.filePath,
  file_path: e.file_path || e.filePath,
  fileName: e.file_name || e.fileName,
  file_name: e.file_name || e.fileName,
  file_type: e.file_type || e.fileType,
});

const mapComplaint = (c: any): Complaint => ({
  id: c.id,
  complaintNumber: c.complaint_number || c.complaintNumber || c.ticket_number,
  category: c.category,
  location: c.location,
  description: c.description,
  reporterId: c.reporter_id || c.reporterId,
  reporterName: c.reporter_name || c.reporter?.name || c.user?.name || 'Anonim',
  date: c.created_at || c.date || new Date().toISOString(),
  status: c.status,
  priority: c.priority || 'RENDAH',
  
  // Field privasi & detail terproteksi
  maskedNik: c.masked_nik || c.maskedNik,
  contactNumber: c.contact_number || c.contactNumber || c.phone,
  email: c.email,
  adminNote: c.admin_note || c.adminNote,

  evidenceUrl: c.evidence_url || c.evidenceUrl || null,
  evidences: Array.isArray(c.evidences || c.complaint_evidences)
    ? (c.evidences || c.complaint_evidences).map(mapEvidence)
    : [],
});

export const complaintService = {
  getComplaints: async (): Promise<Complaint[]> => {
    const res = await api.get('/complaints');
    const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
    return data.map(mapComplaint);
  },

  
  getMyComplaints: async (): Promise<Complaint[]> => {
    const res = await api.get('/complaints/my-complaints');
    const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
    return data.map(mapComplaint);
  },

  getComplaintById: async (id: string): Promise<Complaint> => {
    const res = await api.get(`/complaints/${id}`);
    return mapComplaint(res.data);
  },

  createComplaint: async (formData: FormData): Promise<Complaint> => {
    const res = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return mapComplaint(res.data);
  },

  updateStatus: async (
    id: string, 
    status: string, 
    priority?: string, 
    adminNote?: string
  ): Promise<Complaint> => {
    const res = await api.patch(`/complaints/${id}/status`, { 
      status, 
      priority, 
      admin_note: adminNote 
    });
    return mapComplaint(res.data);
  },

  deleteComplaint: async (id: string): Promise<void> => {
    const res = await api.delete(`/complaints/${id}`);
    return res.data;
  },
};