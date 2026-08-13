import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalRequestApi } from '@/features/approvalRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useApproveApprovalRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approvalRequestApi.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRequests.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorBills.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      pushToast('success', 'Approved.');
    },
  });
}
