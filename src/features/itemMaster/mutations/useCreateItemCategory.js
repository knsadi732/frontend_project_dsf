import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemCategoryApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateItemCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemCategoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemCategories.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Item category'));
    },
  });
}
