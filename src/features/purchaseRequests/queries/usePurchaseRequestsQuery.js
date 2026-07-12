import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { purchaseRequestApi } from '@/features/purchaseRequests/api';
import { queryKeys } from '@/config/queryKeys';

export function usePurchaseRequestsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.purchaseRequests.list(filters),
    queryFn: () => purchaseRequestApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
