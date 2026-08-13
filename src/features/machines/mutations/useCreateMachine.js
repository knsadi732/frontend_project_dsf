import { useMutation, useQueryClient } from '@tanstack/react-query';
import { machineApi } from '@/features/machines/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: machineApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.machines.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Machine'));
    },
  });
}
