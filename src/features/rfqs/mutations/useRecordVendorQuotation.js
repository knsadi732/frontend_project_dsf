import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorQuotationApi } from '@/features/rfqs/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useRecordVendorQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorQuotationApi.record,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfqs.all });
      pushToast('success', 'Vendor quotation recorded');
    },
  });
}
