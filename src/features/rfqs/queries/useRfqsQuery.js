import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { rfqApi } from '@/features/rfqs/api';
import { queryKeys } from '@/config/queryKeys';

export function useRfqsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.rfqs.list(filters),
    queryFn: () => rfqApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
