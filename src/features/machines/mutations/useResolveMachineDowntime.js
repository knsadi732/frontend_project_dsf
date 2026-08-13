import { useMutation, useQueryClient } from '@tanstack/react-query';
import { machineApi } from '@/features/machines/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useResolveMachineDowntime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: machineApi.resolveDowntime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.machines.all });
      pushToast('success', 'Machine back to running.');
    },
  });
}
