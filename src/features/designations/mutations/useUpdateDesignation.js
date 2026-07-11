import { useMutation, useQueryClient } from '@tanstack/react-query';
import { designationApi } from '@/features/designations/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => designationApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.designations.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Designation'));
    },
  });
}
