import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { categoryApi } from '@/features/categories/api';
import { queryKeys } from '@/config/queryKeys';

export function useCategoriesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.categories.list(filters),
    queryFn: () => categoryApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
