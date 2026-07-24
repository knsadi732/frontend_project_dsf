import { useQuery } from '@tanstack/react-query';
import { loanApi } from '@/features/loans/api';
import { queryKeys } from '@/config/queryKeys';

export function useLoanQuery(id) {
  return useQuery({
    queryKey: queryKeys.loans.detail(id),
    queryFn: () => loanApi.get(id),
    enabled: Boolean(id),
  });
}
