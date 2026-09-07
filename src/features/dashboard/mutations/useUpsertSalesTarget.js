import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesTargetApi } from '@/services/salesTarget.api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useUpsertSalesTarget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => salesTargetApi.upsert(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.salesTargets.all });
      pushToast('success', 'Sales target saved.');
    },
  });
}
