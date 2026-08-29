import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemVariantApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateItemVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => itemVariantApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemVariants.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Item variant'));
    },
  });
}
