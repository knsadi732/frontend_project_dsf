import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fixedAssetApi } from '@/features/fixedAssets/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateFixedAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fixedAssetApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fixedAssets.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Asset'));
    },
  });
}
