import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/features/leaves/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: leaveApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Leave request'));
    },
  });
}
