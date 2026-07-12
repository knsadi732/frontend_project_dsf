import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { warehouseZoneApi } from '@/features/warehouseZones/api';
import { queryKeys } from '@/config/queryKeys';

export function useWarehouseZonesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.warehouseZones.list(filters),
    queryFn: () => warehouseZoneApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
