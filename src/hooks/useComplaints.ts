import { useQuery } from '@tanstack/react-query';
import { complaintService } from '../services/complaintService';

export const useComplaints = () => {
  const query = useQuery({
    queryKey: ['complaints'],
    queryFn: complaintService.getComplaints,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    ...query,
    complaints: query.data || [],
    loading: query.isLoading,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};

export const useComplaint = (id: string) => {
  return useQuery({
    queryKey: ['complaints', id],
    queryFn: () => complaintService.getComplaintById(id),
    enabled: !!id,
    retry: 1,
  });
};