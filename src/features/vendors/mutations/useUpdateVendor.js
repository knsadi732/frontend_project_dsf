import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/features/vendors/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => vendorApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Vendor'));
    },
  });
}
