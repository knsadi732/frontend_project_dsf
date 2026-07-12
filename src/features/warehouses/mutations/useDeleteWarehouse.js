import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseApi } from '@/features/warehouses/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: warehouseApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Warehouse'));
    },
  });
}
