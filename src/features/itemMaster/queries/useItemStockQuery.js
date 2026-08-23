import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { itemStockApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';

export function useItemStockQuery(filters) {
  return useQuery({
    queryKey: queryKeys.itemStock.list(filters),
    queryFn: () => itemStockApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
