import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productVariantApi } from '@/features/productVariants/api';
import { queryKeys } from '@/config/queryKeys';

export function useProductVariantsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.productVariants.list(filters),
    queryFn: () => productVariantApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
