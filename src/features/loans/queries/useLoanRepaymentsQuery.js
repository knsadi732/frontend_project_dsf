import { useQuery } from '@tanstack/react-query';
import { loanApi } from '@/features/loans/api';
import { queryKeys } from '@/config/queryKeys';

export function useLoanRepaymentsQuery(loanId) {
  return useQuery({
    queryKey: [...queryKeys.loans.detail(loanId), 'repayments'],
    queryFn: () => loanApi.listRepayments(loanId),
    enabled: Boolean(loanId),
  });
}
