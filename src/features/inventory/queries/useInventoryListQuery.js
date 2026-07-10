import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { inventoryApi } from '@/features/inventory/api';
import { queryKeys } from '@/config/queryKeys';

export function useInventoryListQuery(filters) {
  return useQuery({
    queryKey: queryKeys.inventory.list(filters),
    queryFn: () => inventoryApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
