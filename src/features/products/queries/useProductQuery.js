import { useQuery } from '@tanstack/react-query';
import { productApi } from '@/features/products/api';
import { queryKeys } from '@/config/queryKeys';

export function useProductQuery(id) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => productApi.get(id),
    enabled: Boolean(id),
  });
}
