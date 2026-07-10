import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { purchaseApi } from '@/features/purchases/api';
import { queryKeys } from '@/config/queryKeys';

export function usePurchasesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.purchases.list(filters),
    queryFn: () => purchaseApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
