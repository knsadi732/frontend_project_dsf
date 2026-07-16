import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorPaymentApi } from '@/services/vendorPayment.api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateVendorPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorPaymentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorPayments.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vendorBills.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.communicationLogs.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Vendor payment'));
    },
  });
}
