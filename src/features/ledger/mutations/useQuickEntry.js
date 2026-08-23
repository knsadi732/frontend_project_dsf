import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ledgerApi } from '@/features/ledger/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useQuickEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ledgerApi.quickEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      pushToast('success', 'Ledger entry recorded.');
    },
  });
}
