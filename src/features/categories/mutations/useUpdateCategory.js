import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '@/features/categories/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => categoryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Category'));
    },
  });
}
