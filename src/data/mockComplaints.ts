import type { Complaint } from '../types';

export const mockComplaints: Complaint[] = [
  {
    id: 'c1',
    complaintNumber: 'ADU-2026-00421',
    category: 'Pungutan Liar',
    location: 'Pasar Induk Kramat Jati',
    description: 'Dimintai uang keamanan oleh oknum tidak dikenal saat bongkar muat.',
    reporterId: 'usr-1',
    reporterName: 'Andi Pratama',
    date: '2026-09-22T08:00:00Z',
    status: 'Dalam Penanganan',
    priority: 'Tinggi'
  },
  {
    id: 'c2',
    complaintNumber: 'ADU-2026-00425',
    category: 'Gangguan Ketertiban',
    location: 'Jl. Merdeka No 45',
    description: 'Parkir liar menutupi akses masuk toko.',
    reporterId: 'usr-2',
    reporterName: 'Budi Santoso',
    date: '2026-09-24T15:30:00Z',
    status: 'Verifikasi',
    priority: 'Sedang'
  }
];
