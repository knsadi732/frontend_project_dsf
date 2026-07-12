import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { binApi } from '@/features/bins/api';
import { queryKeys } from '@/config/queryKeys';

export function useBinsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.bins.list(filters),
    queryFn: () => binApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
