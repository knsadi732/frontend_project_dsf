import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loanApi } from '@/features/loans/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateRepayment(loanId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => loanApi.createRepayment(loanId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.loans.detail(loanId), 'repayments'] });
      // Repayment auto-posts a debit finance_transaction.
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Repayment'));
    },
  });
}
