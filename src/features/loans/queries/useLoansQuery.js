import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { loanApi } from '@/features/loans/api';
import { queryKeys } from '@/config/queryKeys';

export function useLoansQuery(filters) {
  return useQuery({
    queryKey: queryKeys.loans.list(filters),
    queryFn: () => loanApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
