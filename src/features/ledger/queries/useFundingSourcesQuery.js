import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/features/ledger/api';
import { queryKeys } from '@/config/queryKeys';

export function useFundingSourcesQuery() {
  return useQuery({
    queryKey: queryKeys.fundingSources.all,
    queryFn: () => ledgerApi.listFundingSources(),
  });
}
