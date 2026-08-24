import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { payableApi } from '@/features/payables/api';
import { queryKeys } from '@/config/queryKeys';

export function usePayablesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.payables.list(filters),
    queryFn: () => payableApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
