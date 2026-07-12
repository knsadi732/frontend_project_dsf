import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creditNoteApi } from '@/features/creditNotes/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateCreditNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: creditNoteApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Credit note'));
    },
  });
}
