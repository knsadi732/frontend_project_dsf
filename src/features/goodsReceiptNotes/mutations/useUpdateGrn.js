import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiptNoteApi } from '@/features/goodsReceiptNotes/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateGrn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => goodsReceiptNoteApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceiptNotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.production.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Goods receipt note'));
    },
  });
}
