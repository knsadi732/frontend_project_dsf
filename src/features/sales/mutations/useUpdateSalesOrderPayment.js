import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/features/sales/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateSalesOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, paymentStatus }) => salesApi.transitionPaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Payment status'));
    },
  });
}
