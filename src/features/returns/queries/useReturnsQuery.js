import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { returnsApi } from '@/features/returns/api';
import { queryKeys } from '@/config/queryKeys';

export function useReturnsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.returns.list(filters),
    queryFn: () => returnsApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
