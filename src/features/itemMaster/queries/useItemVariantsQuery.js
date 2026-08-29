import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { itemVariantApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';

export function useItemVariantsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.itemVariants.list(filters),
    queryFn: () => itemVariantApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
