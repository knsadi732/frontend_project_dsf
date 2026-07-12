import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { shelfApi } from '@/features/shelves/api';
import { queryKeys } from '@/config/queryKeys';

export function useShelvesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.shelves.list(filters),
    queryFn: () => shelfApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
