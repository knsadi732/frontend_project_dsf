import { useMutation, useQueryClient } from '@tanstack/react-query';
import { materialIssueRequestApi } from '@/features/materialIssueRequests/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useRejectMaterialIssueRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: materialIssueRequestApi.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materialIssueRequests.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Material issue request'));
    },
  });
}
