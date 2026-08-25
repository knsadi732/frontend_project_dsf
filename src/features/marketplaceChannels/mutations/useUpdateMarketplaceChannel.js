import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceChannelApi } from '@/features/marketplaceChannels/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateMarketplaceChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => marketplaceChannelApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplaceChannels.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Channel'));
    },
  });
}
