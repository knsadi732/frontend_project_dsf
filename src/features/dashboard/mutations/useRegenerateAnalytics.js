import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useRegenerateAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dashboardApi.regenerate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      pushToast('success', 'Analytics snapshot regenerated');
    },
  });
}
