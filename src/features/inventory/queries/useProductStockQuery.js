import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productStockApi } from '@/services/inventory.api';
import { queryKeys } from '@/config/queryKeys';

export function useProductStockQuery(filters) {
  return useQuery({
    queryKey: [...queryKeys.inventory.list(filters), 'productStock'],
    queryFn: () => productStockApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
