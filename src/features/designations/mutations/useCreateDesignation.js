import { useMutation, useQueryClient } from '@tanstack/react-query';
import { designationApi } from '@/features/designations/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateDesignation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: designationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.designations.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Designation'));
    },
  });
}
