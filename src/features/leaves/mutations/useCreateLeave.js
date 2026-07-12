import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/features/leaves/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Leave request'));
    },
  });
}
