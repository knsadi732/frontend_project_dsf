import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { assetApi } from '@/features/assets/api';
import { queryKeys } from '@/config/queryKeys';

export function useAssetsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.assets.list(filters),
    queryFn: () => assetApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
