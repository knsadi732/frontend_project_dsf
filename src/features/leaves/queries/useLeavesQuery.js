import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { leaveApi } from '@/features/leaves/api';
import { queryKeys } from '@/config/queryKeys';

export function useLeavesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.leaves.list(filters),
    queryFn: () => leaveApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
