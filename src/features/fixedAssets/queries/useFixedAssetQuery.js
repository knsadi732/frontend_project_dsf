import { useQuery } from '@tanstack/react-query';
import { fixedAssetApi } from '@/features/fixedAssets/api';
import { queryKeys } from '@/config/queryKeys';

export function useFixedAssetQuery(id) {
  return useQuery({
    queryKey: queryKeys.fixedAssets.detail(id),
    queryFn: () => fixedAssetApi.get(id),
    enabled: Boolean(id),
  });
}
