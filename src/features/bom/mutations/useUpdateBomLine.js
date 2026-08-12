import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bomApi } from '@/features/bom/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateBomLine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => bomApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bom.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('BOM line'));
    },
  });
}
