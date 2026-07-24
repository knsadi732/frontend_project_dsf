import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ledgerApi } from '@/features/ledger/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useRecordTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ledgerApi.recordTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Transaction'));
    },
  });
}
