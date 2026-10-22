import { api } from './api';

const mapPermit = (p: any): any => ({
  id: String(p.id),
  permitNumber: p.permitNumber || p.permit_number || `PRM-${p.id}`,
  type: p.type || p.permitType || 'Izin Layanan',
  businessName: p.businessName || p.business_name || '-',
  applicantId: p.applicantId || p.applicant_id || '',
  applicantName: p.applicantName || p.applicant_name || p.applicant?.name || 'Pemohon',
  submissionDate: p.submissionDate || p.submission_date || new Date().toISOString(),
  status: p.status || 'Submitted',
  lastUpdate: p.lastUpdate || new Date().toISOString(),
  
  nik: p.nik || '',
  phone: p.phone || '',
  email: p.email || '',
  business_address: p.business_address || p.businessAddress || '',
  documents: p.documents || [] 
});

export const permitService = {
  getPermits: async (): Promise<any[]> => {
    const res = await api.get('/permits');
    return res.data.map(mapPermit);
  },

  createPermit: async (data: FormData | any, file?: File): Promise<any> => {
    if (data instanceof FormData) {
      const res = await api.post('/permits', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    }

    if (file) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      formData.append('file', file);
      formData.append('documents', file);

      const res = await api.post('/permits', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    }

    const res = await api.post('/permits', data);
    return res.data;
  },

  updateStatus: async (id: string, status: string): Promise<any> => {
    const res = await api.patch(`/permits/${id}/status`, { status });
    return res.data;
  },

  deletePermit: async (id: string): Promise<any> => {
    const res = await api.delete(`/permits/${id}`);
    return res.data;
  }
};