import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loanApi } from '@/features/loans/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useWriteOffLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanApi.writeOff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans.all });
      pushToast('success', 'Loan written off');
    },
  });
}
