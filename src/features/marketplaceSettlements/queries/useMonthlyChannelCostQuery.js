import { useQuery } from '@tanstack/react-query';
import { marketplaceSettlementApi } from '@/features/marketplaceSettlements/api';
import { queryKeys } from '@/config/queryKeys';

export function useMonthlyChannelCostQuery(month) {
  return useQuery({
    queryKey: [...queryKeys.marketplaceSettlements.all, 'monthly-channel-cost', month],
    queryFn: () => marketplaceSettlementApi.monthlyChannelCost(month),
  });
}
