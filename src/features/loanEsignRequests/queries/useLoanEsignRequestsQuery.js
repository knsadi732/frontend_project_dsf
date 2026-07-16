import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { loanEsignRequestApi } from '@/features/loanEsignRequests/api';
import { queryKeys } from '@/config/queryKeys';

export function useLoanEsignRequestsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.loanEsignRequests.list(filters),
    queryFn: () => loanEsignRequestApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
