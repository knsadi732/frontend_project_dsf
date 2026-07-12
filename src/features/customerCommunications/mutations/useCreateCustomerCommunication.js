import { useMutation, useQueryClient } from '@tanstack/react-query';
import { customerCommunicationApi } from '@/features/customerCommunications/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useCreateCustomerCommunication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerCommunicationApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customerCommunications.all });
      pushToast('success', 'Communication logged');
    },
  });
}
