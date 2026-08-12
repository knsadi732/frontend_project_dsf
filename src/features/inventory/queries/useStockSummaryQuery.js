import { useQuery } from '@tanstack/react-query';
import { productStockApi } from '@/services/inventory.api';
import { queryKeys } from '@/config/queryKeys';

export function useStockSummaryQuery(filters) {
  return useQuery({
    queryKey: [...queryKeys.inventory.list(filters), 'stockSummary'],
    queryFn: () => productStockApi.summary(filters),
  });
}
