import { useQuery } from '@tanstack/react-query';
import { inventoryMovementApi } from '@/features/inventoryMovements/api';
import { queryKeys } from '@/config/queryKeys';

export function useInventoryMovementsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.inventoryMovements.list(filters),
    queryFn: () => inventoryMovementApi.list(filters),
    refetchOnMount: 'always',
  });
}
