import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rfqApi } from '@/features/rfqs/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rfqApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfqs.all });
      // The source PR flips to 'converted_to_rfq' server-side the moment the
      // RFQ is created (rfq.service.js createRfq) — refresh its list too.
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('RFQ'));
    },
  });
}
