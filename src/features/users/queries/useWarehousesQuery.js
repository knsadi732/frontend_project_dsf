import { useQuery } from '@tanstack/react-query';
import { warehouseApi } from '@/services/warehouse.api';
import { queryKeys } from '@/config/queryKeys';

export function useWarehousesQuery() {
  return useQuery({
    queryKey: queryKeys.warehouses.list({}),
    queryFn: () => warehouseApi.list({ pageSize: 100 }),
  });
}
