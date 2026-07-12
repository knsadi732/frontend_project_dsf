import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseRequestApi } from '@/features/purchaseRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => purchaseRequestApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Purchase request'));
    },
  });
}
