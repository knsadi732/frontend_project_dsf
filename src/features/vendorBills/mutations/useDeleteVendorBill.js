import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorBillApi } from '@/features/vendorBills/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteVendorBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorBillApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorBills.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Vendor bill'));
    },
  });
}
