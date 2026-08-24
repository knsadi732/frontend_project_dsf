import { useQuery } from '@tanstack/react-query';
import { payableApi } from '@/features/payables/api';
import { queryKeys } from '@/config/queryKeys';

export function usePayableQuery(id) {
  return useQuery({
    queryKey: queryKeys.payables.detail(id),
    queryFn: () => payableApi.get(id),
    enabled: Boolean(id),
  });
}
