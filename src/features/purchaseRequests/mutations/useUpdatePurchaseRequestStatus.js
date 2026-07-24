import { useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseRequestApi } from '@/features/purchaseRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

// PATCH /purchase-requests/:id/status only accepts approved/rejected —
// there is no generic edit endpoint, so this is the only mutation besides
// create.
export function useUpdatePurchaseRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => purchaseRequestApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Purchase request'));
    },
  });
}
