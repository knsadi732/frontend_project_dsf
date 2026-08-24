import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payableApi } from '@/features/payables/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreatePayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payableApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payables.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Payable'));
    },
  });
}
