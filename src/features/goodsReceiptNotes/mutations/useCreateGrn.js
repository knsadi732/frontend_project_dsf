import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiptNoteApi } from '@/features/goodsReceiptNotes/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateGrn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ poId, payload }) => goodsReceiptNoteApi.createForPurchaseOrder(poId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceiptNotes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchases.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Goods receipt note'));
    },
  });
}
