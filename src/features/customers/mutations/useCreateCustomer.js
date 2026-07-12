import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '@/features/customers/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Customer'));
    },
  });
}
