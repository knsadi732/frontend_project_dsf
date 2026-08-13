import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalRequestApi } from '@/features/approvalRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useCreateVendorPaymentRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approvalRequestApi.createVendorPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRequests.all });
      pushToast('success', 'Payment sent for Owner approval.');
    },
  });
}
