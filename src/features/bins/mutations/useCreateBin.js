import { useMutation, useQueryClient } from '@tanstack/react-query';
import { binApi } from '@/features/bins/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateBin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: binApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bins.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Bin'));
    },
  });
}
