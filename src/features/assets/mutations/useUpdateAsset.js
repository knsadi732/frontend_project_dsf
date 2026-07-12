import { useMutation, useQueryClient } from '@tanstack/react-query';
import { assetApi } from '@/features/assets/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => assetApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.assets.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Asset'));
    },
  });
}
