import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fixedAssetApi } from '@/features/fixedAssets/api';
import { queryKeys } from '@/config/queryKeys';

export function useFixedAssetMaintenanceLogsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.fixedAssetMaintenance.list(filters),
    queryFn: () => fixedAssetApi.listMaintenanceLogs(filters),
    placeholderData: keepPreviousData,
  });
}
