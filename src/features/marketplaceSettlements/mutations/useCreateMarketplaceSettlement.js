import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceSettlementApi } from '@/features/marketplaceSettlements/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateMarketplaceSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marketplaceSettlementApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplaceSettlements.all });
      // Settlement posts a credit finance_transaction for netAmountReceived.
      queryClient.invalidateQueries({ queryKey: queryKeys.ledger.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Settlement'));
    },
  });
}
