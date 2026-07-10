import { useQuery } from '@tanstack/react-query';
import { productionApi } from '@/features/production/api';
import { queryKeys } from '@/config/queryKeys';

export function useWorkOrderQuery(id) {
  return useQuery({
    queryKey: queryKeys.production.detail(id),
    queryFn: () => productionApi.get(id),
    enabled: Boolean(id),
  });
}
