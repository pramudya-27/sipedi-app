export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'ADMIN' | 'OFFICER';
  createdAt?: string;
  created_at?: string;
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

export interface ComplaintEvidence {
  id: string;
  file_path?: string;
  filePath?: string;
  file_name?: string;
  fileName?: string;
  file_type?: string;
}

export interface Complaint {
  id: string;
  complaintNumber: string;
  category: string;
  location: string;
  description: string;
  reporterId?: string;
  reporterName?: string;
  date: string;
  status: 'Baru' | 'Dalam Penanganan' | 'Selesai' | 'Ditolak';
  priority?: 'RENDAH' | 'SEDANG' | 'TINGGI' | 'Rendah' | 'Sedang' | 'Tinggi';
  
  // Field privasi & detail operasional
  maskedNik?: string;
  contactNumber?: string;
  email?: string;
  adminNote?: string;

  evidenceUrl?: string | null;
  evidences?: ComplaintEvidence[];
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