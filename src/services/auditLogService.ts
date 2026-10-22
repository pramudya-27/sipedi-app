import { api } from './api';

export interface AuditLogItem {
  id: string;
  user_name: string;
  role: string;
  action: string;
  module: string;
  reference: string;
  status: 'SUCCESS' | 'FAILED';
  created_at: string;
}

export const auditLogService = {
  getLogs: async (): Promise<AuditLogItem[] | { data: AuditLogItem[] }> => {
    
    const response = await api.get('/audit-logs');
    return response.data;
  }
};