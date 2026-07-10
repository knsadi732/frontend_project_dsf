import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/features/purchases/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeletePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Purchase order'));
    },
  });
}
