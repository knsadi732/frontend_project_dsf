import { useQuery } from '@tanstack/react-query';
import { purchaseApi } from '@/features/purchases/api';
import { queryKeys } from '@/config/queryKeys';

export function usePurchaseQuery(id) {
  return useQuery({
    queryKey: queryKeys.purchases.detail(id),
    queryFn: () => purchaseApi.get(id),
    enabled: Boolean(id),
  });
}
