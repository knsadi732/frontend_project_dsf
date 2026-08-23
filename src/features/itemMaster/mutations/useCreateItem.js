import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Item'));
    },
  });
}
