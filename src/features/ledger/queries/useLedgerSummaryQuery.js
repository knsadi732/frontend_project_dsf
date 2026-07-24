import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/features/ledger/api';
import { queryKeys } from '@/config/queryKeys';

export function useLedgerSummaryQuery(filters) {
  return useQuery({
    queryKey: queryKeys.ledger.list({ summary: true, ...filters }),
    queryFn: () => ledgerApi.summary(filters),
  });
}
