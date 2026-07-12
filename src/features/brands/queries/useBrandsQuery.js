import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { brandApi } from '@/features/brands/api';
import { queryKeys } from '@/config/queryKeys';

export function useBrandsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.brands.list(filters),
    queryFn: () => brandApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
