import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payableApi } from '@/features/payables/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreatePayablePayment(payableId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => payableApi.createPayment(payableId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payables.all });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.payables.detail(payableId), 'payments'] });
      // Payment auto-posts a debit finance_transaction.
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Payment'));
    },
  });
}
