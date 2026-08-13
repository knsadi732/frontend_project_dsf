import { useMutation, useQueryClient } from '@tanstack/react-query';
import { machineApi } from '@/features/machines/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useReportMachineDown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => machineApi.reportDown(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.machines.all });
      pushToast('success', 'Machine reported down.');
    },
  });
}
