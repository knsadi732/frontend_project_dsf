import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/features/finance/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Invoice'));
    },
  });
}
