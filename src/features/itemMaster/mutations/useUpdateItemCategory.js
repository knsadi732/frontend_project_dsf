import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemCategoryApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => itemCategoryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemCategories.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Item category'));
    },
  });
}
