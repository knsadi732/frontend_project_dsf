import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/features/vendors/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Vendor'));
    },
  });
}
