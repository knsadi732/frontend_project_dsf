import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fixedAssetApi } from '@/features/fixedAssets/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useDisposeFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => fixedAssetApi.dispose(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedAssets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedAssets.detail(id) });
      pushToast('success', 'Asset disposed.');
    },
  });
}
