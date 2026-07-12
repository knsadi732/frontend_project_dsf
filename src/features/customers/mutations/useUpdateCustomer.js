import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/features/customers/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => customerApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Customer'));
    },
  });
}
