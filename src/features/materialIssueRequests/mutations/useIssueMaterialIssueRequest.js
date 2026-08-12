import { useMutation, useQueryClient } from '@tanstack/react-query';
import { materialIssueRequestApi } from '@/features/materialIssueRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useIssueMaterialIssueRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialIssueRequestApi.issue,
    onSuccess: () => {
      // Issuing deducts on-hand stock, so refresh Inventory alongside this
      // module's own list.
      queryClient.invalidateQueries({ queryKey: queryKeys.materialIssueRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Material issue request'));
    },
  });
}
