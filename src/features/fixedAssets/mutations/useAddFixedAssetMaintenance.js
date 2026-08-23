import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fixedAssetApi } from '@/features/fixedAssets/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useAddFixedAssetMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => fixedAssetApi.addMaintenance(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedAssets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedAssets.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedAssetMaintenance.all });
      pushToast('success', 'Maintenance logged.');
    },
  });
}
