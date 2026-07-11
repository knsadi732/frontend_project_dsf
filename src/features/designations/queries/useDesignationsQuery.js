import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { designationApi } from '@/features/designations/api';
import { queryKeys } from '@/config/queryKeys';

export function useDesignationsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.designations.list(filters),
    queryFn: () => designationApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
