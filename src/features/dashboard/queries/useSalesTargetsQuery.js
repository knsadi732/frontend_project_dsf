import { useQuery } from '@tanstack/react-query';
import { salesTargetApi } from '@/services/salesTarget.api';
import { queryKeys } from '@/config/queryKeys';

export function useSalesTargetsQuery() {
  return useQuery({
    queryKey: queryKeys.salesTargets.all,
    queryFn: () => salesTargetApi.list(),
  });
}
