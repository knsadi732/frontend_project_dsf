import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '@/features/company/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => companyApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.company.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Company profile'));
    },
  });
}
