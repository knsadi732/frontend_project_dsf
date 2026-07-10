import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/features/finance/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Invoice'));
    },
  });
}
