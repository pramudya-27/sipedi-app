import type { Permit } from '../types';

export const mockPermits: Permit[] = [
  {
    id: 'p1',
    permitNumber: 'SIP-2026-0012',
    type: 'Izin Usaha Mikro',
    businessName: 'Warung Makan Sederhana',
    applicantId: 'usr-1',
    applicantName: 'Andi Pratama',
    submissionDate: '2026-09-20T10:00:00Z',
    status: 'Under Verification',
    lastUpdate: '2026-09-21T08:30:00Z'
  },
  {
    id: 'p2',
    permitNumber: 'SIP-2026-0015',
    type: 'Izin Reklame',
    businessName: 'Toko Elektronik Maju',
    applicantId: 'usr-1',
    applicantName: 'Andi Pratama',
    submissionDate: '2026-09-15T14:20:00Z',
    status: 'Approved',
    lastUpdate: '2026-09-18T09:15:00Z'
  },
  {
    id: 'p3',
    permitNumber: 'SIP-2026-0020',
    type: 'Izin Mendirikan Bangunan (IMB) Mikro',
    businessName: 'Kios Buah',
    applicantId: 'usr-2',
    applicantName: 'Budi Santoso',
    submissionDate: '2026-09-24T11:00:00Z',
    status: 'Submitted',
    lastUpdate: '2026-09-24T11:00:00Z'
  }
];
