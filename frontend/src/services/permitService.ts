import { api } from './api';

const mapPermit = (p: any): any => ({
  id: String(p.id),
  permitNumber: p.permitNumber || p.permit_number || `PRM-${p.id}`,
  permit_number: p.permitNumber || p.permit_number || `PRM-${p.id}`,
  type: p.type || p.permitType || 'Izin Layanan',
  permitType: p.type || p.permitType || 'Izin Layanan',
  businessName: p.businessName || p.business_name || '-',
  business_name: p.businessName || p.business_name || '-',
  applicantId: p.applicantId || p.applicant_id || '',
  applicantName: p.applicantName || p.applicant_name || p.applicant?.name || 'Pemohon',
  applicant_name: p.applicantName || p.applicant_name || p.applicant?.name || 'Pemohon',
  submissionDate: p.submissionDate || p.submission_date || new Date().toISOString(),
  submission_date: p.submissionDate || p.submission_date || new Date().toISOString(),
  status: p.status || 'Submitted',
  lastUpdate: p.lastUpdate || p.last_update || new Date().toISOString(),
  
  nik: p.nik || '',
  phone: p.phone || '',
  email: p.email || '',
  business_address: p.business_address || p.businessAddress || '',
  business_sector: p.business_sector || 'Perdagangan & Jasa',
  
  duration_months: p.duration_months || 1,
  start_date: p.start_date || null,
  approved_at: p.approved_at || null,
  expired_at: p.expired_at || null,
  remaining_days: p.remaining_days ?? null,
  rejection_reason: p.rejection_reason || '',
  pdf_path: p.pdf_path || '',
  qr_code_path: p.qr_code_path || '',
  active_version: p.active_version || 1,

  documents: p.documents || [],
  renewals: p.renewals || [],
  latest_invoice: p.latest_invoice || null
});

export const permitService = {
  getPermits: async (): Promise<any[]> => {
    const res = await api.get('/permits');
    const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
    return data.map(mapPermit);
  },

  getMyPermits: async (): Promise<any[]> => {
    const res = await api.get('/permits/my-permits');
    const data = Array.isArray(res.data) ? res.data : (res.data.items || []);
    return data.map(mapPermit);
  },

  getPermitById: async (id: string): Promise<any> => {
    const res = await api.get(`/permits/${id}`);
    return mapPermit(res.data);
  },

  createPermit: async (data: FormData | any, file?: File): Promise<any> => {
    if (data instanceof FormData) {
      const res = await api.post('/permits', data, { timeout: 90000 });
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

      const res = await api.post('/permits', formData, { timeout: 90000 });
      return res.data;
    }

    const res = await api.post('/permits', data, { timeout: 90000 });
    return res.data;
  },

  updateStatus: async (id: string, status: string, extraData?: any): Promise<any> => {
    const payload = { status, ...(extraData || {}) };
    const res = await api.patch(`/permits/${id}/status`, payload);
    return res.data;
  },

  requestRenewal: async (id: string, durationMonths: number = 1, notes: string = ''): Promise<any> => {
    const res = await api.post(`/permits/${id}/request-renewal`, {
      duration_months: durationMonths,
      notes
    });
    return res.data;
  },

  resendApprovalEmail: async (id: string): Promise<any> => {
    const res = await api.post(`/permits/${id}/resend-email`);
    return res.data;
  },

  checkExpiredPermits: async (): Promise<any> => {
    const res = await api.post('/permits/check-expired');
    return res.data;
  },

  checkNikAvailability: async (nik: string): Promise<any> => {
    const res = await api.get(`/permits/check-nik?nik=${encodeURIComponent(nik)}`);
    return res.data;
  },

  deletePermit: async (id: string): Promise<any> => {
    const res = await api.delete(`/permits/${id}`);
    return res.data;
  }
};
