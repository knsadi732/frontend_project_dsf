import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productApi } from '@/features/products/api';
import { queryKeys } from '@/config/queryKeys';

export function useProductsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.products.list(filters),
    queryFn: () => productApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
