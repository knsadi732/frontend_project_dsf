import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rfqApi } from '@/features/rfqs/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useSendRfq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => rfqApi.send(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfqs.all });
      pushToast('success', 'RFQ sent to vendors');
    },
  });
}
