import { useQuery } from '@tanstack/react-query';
import { permitService } from '../services/permitService';

export const usePermits = () => {
  return useQuery({
    queryKey: ['permits'],
    queryFn: permitService.getPermits
  });
};

export const usePermit = (id: string) => {
  return useQuery({
    queryKey: ['permits', id],
    queryFn: () => permitService.getPermitById(id),
    enabled: !!id,
  });
};
