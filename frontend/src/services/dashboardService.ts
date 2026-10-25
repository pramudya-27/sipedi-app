import { api } from './api';

export interface DashboardStats {
  totalPermits: number;
  pendingPermits: number;
  newComplaints: number;
  resolvedComplaints: number;
  resolutionRate: string;
}

export interface MonthlyTrend {
  month: string;
  pengaduan: number;
  perizinan: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface ActivityLog {
  id: string;
  userName: string;
  activity: string;
  referenceNo: string;
  status: string;
  timeAgo: string;
}

export interface DashboardDataResponse {
  stats: DashboardStats;
  monthlyTrends: MonthlyTrend[];
  categoryDistribution: CategoryDistribution[];
  recentActivities: ActivityLog[];
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardDataResponse> => {

    const response = await api.get('/v1/admin/stats');
    return response.data;
  },
};