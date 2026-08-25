import { useQuery } from '@tanstack/react-query';
import { marketplaceSettlementApi } from '@/features/marketplaceSettlements/api';
import { queryKeys } from '@/config/queryKeys';

export function useMonthlyProductCostQuery(month) {
  return useQuery({
    queryKey: [...queryKeys.marketplaceSettlements.all, 'monthly-product-cost', month],
    queryFn: () => marketplaceSettlementApi.monthlyProductCost(month),
  });
}
