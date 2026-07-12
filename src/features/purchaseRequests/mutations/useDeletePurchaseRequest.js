import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseRequestApi } from '@/features/purchaseRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeletePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseRequestApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Purchase request'));
    },
  });
}
