import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productVariantApi } from '@/features/productVariants/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => productVariantApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productVariants.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Product variant'));
    },
  });
}
