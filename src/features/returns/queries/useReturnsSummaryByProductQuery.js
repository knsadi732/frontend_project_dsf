import { useQuery } from '@tanstack/react-query';
import { returnsApi } from '@/features/returns/api';
import { queryKeys } from '@/config/queryKeys';

export function useReturnsSummaryByProductQuery(filters) {
  return useQuery({
    queryKey: [...queryKeys.returns.all, 'summary-by-product', filters],
    queryFn: () => returnsApi.summaryByProduct(filters),
  });
}
