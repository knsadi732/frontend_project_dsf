import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionApi } from '@/features/production/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Work order'));
    },
  });
}
