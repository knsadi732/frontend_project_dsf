import { useQuery } from '@tanstack/react-query';
import { productionApi } from '@/features/production/api';
import { queryKeys } from '@/config/queryKeys';

// `range` ({from, to}) scopes overhead to a period other than the current
// calendar month — e.g. the dashboard's Monthly/Quarterly/Yearly selector.
export function useOverheadPerUnitQuery(range) {
  return useQuery({
    queryKey: [...queryKeys.production.all, 'overhead-per-unit', range?.from, range?.to],
    queryFn: () => productionApi.overheadPerUnit(range),
  });
}
