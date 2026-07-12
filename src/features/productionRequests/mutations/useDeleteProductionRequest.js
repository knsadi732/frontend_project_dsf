import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionRequestApi } from '@/features/productionRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteProductionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionRequestApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productionRequests.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Production request'));
    },
  });
}
