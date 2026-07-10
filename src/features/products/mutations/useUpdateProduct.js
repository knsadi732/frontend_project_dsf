import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '@/features/products/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => productApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Product'));
    },
  });
}
