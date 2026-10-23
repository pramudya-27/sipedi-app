import { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import type { DashboardDataResponse } from '../services/dashboardService';

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await dashboardService.getDashboardData();
      setData(result);
    } catch (error) {
      console.warn('Gagal memuat statistik real-time dashboard:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return { data, isLoading, isError, refetch: fetchDashboardData };
};