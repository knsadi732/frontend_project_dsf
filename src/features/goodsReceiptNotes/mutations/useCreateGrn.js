import { useMutation, useQueryClient } from '@tanstack/react-query';
import { goodsReceiptNoteApi } from '@/features/goodsReceiptNotes/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateGrn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goodsReceiptNoteApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceiptNotes.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Goods receipt note'));
    },
  });
}
