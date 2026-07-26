import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorBillApi } from '@/features/vendorBills/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useRecordVendorBillPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount, utrNumber }) => vendorBillApi.recordPayment(id, { amount, utrNumber }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorBills.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Vendor payment'));
    },
  });
}
