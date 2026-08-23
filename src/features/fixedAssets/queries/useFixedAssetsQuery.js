import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fixedAssetApi } from '@/features/fixedAssets/api';
import { queryKeys } from '@/config/queryKeys';

export function useFixedAssetsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.fixedAssets.list(filters),
    queryFn: () => fixedAssetApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
