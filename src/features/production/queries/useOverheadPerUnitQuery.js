import { useQuery } from '@tanstack/react-query';
import { productionApi } from '@/features/production/api';
import { queryKeys } from '@/config/queryKeys';

export function useOverheadPerUnitQuery() {
  return useQuery({
    queryKey: [...queryKeys.production.all, 'overhead-per-unit'],
    queryFn: () => productionApi.overheadPerUnit(),
  });
}
