import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/features/customers/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Customer'));
    },
  });
}
