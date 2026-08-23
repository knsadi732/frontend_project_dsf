import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { itemCategoryApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';

export function useItemCategoriesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.itemCategories.list(filters),
    queryFn: () => itemCategoryApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
