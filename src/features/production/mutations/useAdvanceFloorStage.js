import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productionApi } from '@/features/production/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useAdvanceFloorStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, floorStage }) => productionApi.advanceFloorStage(id, floorStage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      pushToast('success', 'Floor stage advanced.');
    },
  });
}
