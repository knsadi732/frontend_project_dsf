import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportApi } from '@/features/reports/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportApi.generate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
      pushToast('success', 'Report generation started');
    },
  });
}
