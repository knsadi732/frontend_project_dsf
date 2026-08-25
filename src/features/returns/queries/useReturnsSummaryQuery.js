import { useQuery } from '@tanstack/react-query';
import { returnsApi } from '@/features/returns/api';
import { queryKeys } from '@/config/queryKeys';

export function useReturnsSummaryQuery(filters) {
  return useQuery({
    queryKey: [...queryKeys.returns.all, 'summary', filters],
    queryFn: () => returnsApi.summary(filters),
  });
}
