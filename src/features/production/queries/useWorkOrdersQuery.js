import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productionApi } from '@/features/production/api';
import { queryKeys } from '@/config/queryKeys';

export function useWorkOrdersQuery(filters) {
  return useQuery({
    queryKey: queryKeys.production.list(filters),
    queryFn: () => productionApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
