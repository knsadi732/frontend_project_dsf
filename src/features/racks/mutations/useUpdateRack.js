import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rackApi } from '@/features/racks/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateRack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => rackApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.racks.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Rack'));
    },
  });
}
