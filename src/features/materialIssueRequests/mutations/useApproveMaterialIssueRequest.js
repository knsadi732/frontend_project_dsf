import { useMutation, useQueryClient } from '@tanstack/react-query';
import { materialIssueRequestApi } from '@/features/materialIssueRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useApproveMaterialIssueRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialIssueRequestApi.approve,
    onSuccess: () => {
      // Approval reserves stock and may auto-raise a shortfall Purchase
      // Request, so refresh Inventory and Purchase Requests alongside this
      // module's own list.
      queryClient.invalidateQueries({ queryKey: queryKeys.materialIssueRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Material issue request'));
    },
  });
}
