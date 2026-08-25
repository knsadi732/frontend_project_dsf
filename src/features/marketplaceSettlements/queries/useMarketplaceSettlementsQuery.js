import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { marketplaceSettlementApi } from '@/features/marketplaceSettlements/api';
import { queryKeys } from '@/config/queryKeys';

export function useMarketplaceSettlementsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.marketplaceSettlements.list(filters),
    queryFn: () => marketplaceSettlementApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
