import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loanApi } from '@/features/loans/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      // Disbursement auto-posts a credit finance_transaction.
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Loan'));
    },
  });
}
