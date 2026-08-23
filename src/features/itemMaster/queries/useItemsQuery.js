import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { itemApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';

export function useItemsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.items.list(filters),
    queryFn: () => itemApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
