import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '@/features/finance/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => financeApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Invoice'));
    },
  });
}
