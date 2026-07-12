import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionRequestApi } from '@/features/productionRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateProductionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionRequestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productionRequests.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Production request'));
    },
  });
}
