import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemVariantApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateItemVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: itemVariantApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemVariants.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Item variant'));
    },
  });
}
