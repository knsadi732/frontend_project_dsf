import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approvalRequestApi } from '@/features/approvalRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useRejectApprovalRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approvalRequestApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.approvalRequests.all });
      pushToast('success', 'Rejected.');
    },
  });
}
