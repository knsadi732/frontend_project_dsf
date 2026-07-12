import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productVariantApi } from '@/features/productVariants/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productVariantApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.productVariants.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Product variant'));
    },
  });
}
