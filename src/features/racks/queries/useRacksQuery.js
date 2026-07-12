import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { rackApi } from '@/features/racks/api';
import { queryKeys } from '@/config/queryKeys';

export function useRacksQuery(filters) {
  return useQuery({
    queryKey: queryKeys.racks.list(filters),
    queryFn: () => rackApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
