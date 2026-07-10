import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionApi } from '@/features/production/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => productionApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Work order'));
    },
  });
}
