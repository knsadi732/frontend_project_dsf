import { useMutation, useQueryClient } from '@tanstack/react-query';
import { branchApi } from '@/features/branches/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => branchApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Branch'));
    },
  });
}
