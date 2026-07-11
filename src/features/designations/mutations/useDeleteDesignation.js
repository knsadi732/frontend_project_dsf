import { useMutation, useQueryClient } from '@tanstack/react-query';
import { designationApi } from '@/features/designations/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: designationApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.designations.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Designation'));
    },
  });
}
