import { useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityInspectionApi } from '@/features/qualityInspections/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useCreateQualityInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: qualityInspectionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.qualityInspections.all });
      pushToast('success', 'Quality inspection recorded');
    },
  });
}
