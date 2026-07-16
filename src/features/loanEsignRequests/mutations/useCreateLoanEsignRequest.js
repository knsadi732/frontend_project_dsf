import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loanEsignRequestApi } from '@/features/loanEsignRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useCreateLoanEsignRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loanEsignRequestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loanEsignRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.communicationLogs.all });
      pushToast('success', 'Loan e-sign request sent');
    },
  });
}
