import { useMutation, useQueryClient } from '@tanstack/react-query';
import { returnsApi } from '@/features/returns/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: returnsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.returns.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Return'));
    },
  });
}
