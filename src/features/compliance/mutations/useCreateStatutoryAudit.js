import { useMutation, useQueryClient } from '@tanstack/react-query';
import { statutoryAuditApi } from '@/features/compliance/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateStatutoryAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: statutoryAuditApi.record,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.statutoryAudits.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Statutory audit'));
    },
  });
}
