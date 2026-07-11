import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi } from '@/features/purchases/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => purchaseApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Purchase order'));
    },
  });
}
