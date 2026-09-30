import { api } from './api';
import type { Permit } from '../types';

const mapPermit = (p: any): Permit => ({
  id: p.id,
  permitNumber: p.permit_number || p.permitNumber,
  type: p.type,
  businessName: p.business_name || p.businessName,
  applicantId: p.applicant_id || p.applicantId,
  applicantName: p.applicant?.name || 'User',
  submissionDate: p.submission_date || p.submissionDate || new Date().toISOString(),
  status: p.status,
  lastUpdate: p.last_update || p.lastUpdate || new Date().toISOString()
});

export const permitService = {
  getPermits: async (): Promise<Permit[]> => {
    return api.get('/permits').then(res => res.data.map(mapPermit));
  },

  getPermitById: async (id: string): Promise<Permit> => {
    return api.get(`/permits/${id}`).then(res => mapPermit(res.data));
  },

  createPermit: async (formData: FormData): Promise<Permit> => {
    return api.post('/permits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => mapPermit(res.data));
  },
  
  updateStatus: async (id: string, status: string): Promise<Permit> => {
    return api.put(`/permits/${id}/status`, { status }).then(res => mapPermit(res.data));
  }
};
