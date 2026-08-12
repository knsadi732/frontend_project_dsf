import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bomApi } from '@/features/bom/api';
import { queryKeys } from '@/config/queryKeys';

export function useBomLinesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.bom.list(filters),
    queryFn: () => bomApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
