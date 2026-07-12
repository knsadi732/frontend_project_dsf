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
      queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Payment'));
    },
  });
}
