import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/features/purchases/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Purchase order'));
    },
  });
}
