import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '@/features/payments/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
      // Every payment-slip auto-creates a linked finance_transaction.
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Payment'));
    },
  });
}
