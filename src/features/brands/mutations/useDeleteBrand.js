import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandApi } from '@/features/brands/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: brandApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Brand'));
    },
  });
}
