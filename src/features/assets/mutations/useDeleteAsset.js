import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '@/features/assets/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assetApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Asset'));
    },
  });
}
