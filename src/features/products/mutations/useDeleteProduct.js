import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/features/products/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Product'));
    },
  });
}
