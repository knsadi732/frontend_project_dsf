import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rfqApi } from '@/features/rfqs/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useSelectVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, vendorQuotationId }) => rfqApi.selectVendor(id, vendorQuotationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfqs.all });
      pushToast('success', 'Vendor selected');
    },
  });
}
