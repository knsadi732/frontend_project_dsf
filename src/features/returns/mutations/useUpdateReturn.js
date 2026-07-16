import { useMutation, useQueryClient } from '@tanstack/react-query';
import { returnsApi } from '@/features/returns/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => returnsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.communicationLogs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Return'));
    },
  });
}
