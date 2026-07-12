import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { warehouseApi } from '@/features/warehouses/api';
import { queryKeys } from '@/config/queryKeys';

export function useWarehousesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.warehouses.list(filters),
    queryFn: () => warehouseApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
