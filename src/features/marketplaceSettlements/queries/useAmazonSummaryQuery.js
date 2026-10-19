import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { marketplaceSettlementApi } from '@/features/marketplaceSettlements/api';
import { queryKeys } from '@/config/queryKeys';

export function useAmazonSummaryQuery(range, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...queryKeys.marketplaceSettlements.all, 'amazon-summary', range?.from ?? null, range?.to ?? null],
    queryFn: () => marketplaceSettlementApi.amazonSummary(range),
    enabled,
    placeholderData: keepPreviousData,
  });
}
