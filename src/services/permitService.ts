// import { api } from './api';
import type { Permit } from '../types';
import { mockPermits } from '../data/mockPermits';

// For MVP, we use mock data wrapped in Promises to simulate network requests.
// When connecting to FastAPI, replace the mock returns with `return api.get('/permits')` etc.

export const permitService = {
  getPermits: async (): Promise<Permit[]> => {
    // return api.get('/permits').then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPermits), 500);
    });
  },

  getPermitById: async (id: string): Promise<Permit | undefined> => {
    // return api.get(`/permits/${id}`).then(res => res.data);
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPermits.find(p => p.id === id)), 500);
    });
  },

  createPermit: async (data: Partial<Permit>): Promise<Permit> => {
    // return api.post('/permits', data).then(res => res.data);
    return new Promise((resolve) => {
      const newPermit = {
        ...data,
        id: `p${Date.now()}`,
        permitNumber: `SIP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        status: 'Submitted' as const,
        submissionDate: new Date().toISOString(),
        lastUpdate: new Date().toISOString()
      } as Permit;
      setTimeout(() => resolve(newPermit), 1000);
    });
  }
};
