import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shelfApi } from '@/features/shelves/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateShelf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => shelfApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shelves.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Shelf'));
    },
  });
}
