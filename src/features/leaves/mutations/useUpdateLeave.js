import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '@/features/leaves/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => leaveApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.leaves.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Leave request'));
    },
  });
}
