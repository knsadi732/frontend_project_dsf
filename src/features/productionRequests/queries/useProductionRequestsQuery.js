import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { productionRequestApi } from '@/features/productionRequests/api';
import { queryKeys } from '@/config/queryKeys';

export function useProductionRequestsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.productionRequests.list(filters),
    queryFn: () => productionRequestApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
