import { useQuery } from '@tanstack/react-query';
import { gstProfileApi } from '@/features/compliance/api';
import { queryKeys } from '@/config/queryKeys';

export function useGstProfileQuery() {
  return useQuery({
    queryKey: queryKeys.gstProfile.all,
    queryFn: gstProfileApi.get,
  });
}
