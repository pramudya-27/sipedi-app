import { useQuery } from '@tanstack/react-query';
import { complaintService } from '../services/complaintService';

export const useComplaints = () => {
  return useQuery({
    queryKey: ['complaints'],
    queryFn: complaintService.getComplaints
  });
};

export const useComplaint = (id: string) => {
  return useQuery({
    queryKey: ['complaints', id],
    queryFn: () => complaintService.getComplaintById(id),
    enabled: !!id,
  });
};
