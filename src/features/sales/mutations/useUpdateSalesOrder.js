import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/features/sales/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => salesApi.transitionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Sales order'));
    },
  });
}
