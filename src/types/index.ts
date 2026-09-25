export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICER';
}

export interface Permit {
  id: string;
  permitNumber: string;
  type: string;
  businessName: string;
  applicantId: string;
  applicantName: string;
  submissionDate: string;
  status: 'Draft' | 'Submitted' | 'Under Verification' | 'Revision Required' | 'Approved' | 'Rejected';
  lastUpdate: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  category: string;
  location: string;
  description: string;
  reporterId: string;
  reporterName: string;
  date: string;
  status: 'Baru' | 'Verifikasi' | 'Diteruskan' | 'Dalam Penanganan' | 'Selesai';
  priority: 'Rendah' | 'Sedang' | 'Tinggi';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  reference: string;
  status: string;
}
