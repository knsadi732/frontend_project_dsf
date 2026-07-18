import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/features/ledger/api';
import { queryKeys } from '@/config/queryKeys';

export function useLedgerQuery() {
  return useQuery({
    queryKey: queryKeys.ledger.all,
    queryFn: () => ledgerApi.list(),
  });
}
