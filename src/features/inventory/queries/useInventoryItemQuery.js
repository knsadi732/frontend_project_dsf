import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '@/features/inventory/api';
import { queryKeys } from '@/config/queryKeys';

export function useInventoryItemQuery(id) {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id),
    queryFn: () => inventoryApi.get(id),
    enabled: Boolean(id),
  });
}
