import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseRequestApi } from '@/features/purchaseRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseRequestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Purchase request'));
    },
  });
}
