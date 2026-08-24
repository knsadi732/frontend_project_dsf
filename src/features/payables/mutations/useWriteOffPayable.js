import { useMutation, useQueryClient } from '@tanstack/react-query';
import { payableApi } from '@/features/payables/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useWriteOffPayable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payableApi.writeOff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payables.all });
      pushToast('success', 'Payable written off');
    },
  });
}
