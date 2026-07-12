import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditNoteApi } from '@/features/creditNotes/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creditNoteApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Credit note'));
    },
  });
}
