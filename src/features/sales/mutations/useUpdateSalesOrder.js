import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/features/sales/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => salesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Sales order'));
    },
  });
}
