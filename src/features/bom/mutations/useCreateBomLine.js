import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bomApi } from '@/features/bom/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateBomLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bomApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bom.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('BOM line'));
    },
  });
}
