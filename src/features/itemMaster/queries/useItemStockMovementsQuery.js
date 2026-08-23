import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { itemStockApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';

export function useItemStockMovementsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.itemStockMovements.list(filters),
    queryFn: () => itemStockApi.listMovements(filters),
    placeholderData: keepPreviousData,
  });
}
