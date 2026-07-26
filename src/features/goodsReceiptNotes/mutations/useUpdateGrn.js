import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiptNoteApi } from '@/features/goodsReceiptNotes/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

// No generic edit endpoint exists — only PATCH /grn/:id/status
// (draft -> inspected -> completed, or rejected off inspected).
export function useUpdateGrn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => goodsReceiptNoteApi.transitionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceiptNotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Goods receipt note'));
    },
  });
}
