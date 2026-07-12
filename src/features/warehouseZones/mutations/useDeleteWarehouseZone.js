import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseZoneApi } from '@/features/warehouseZones/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useDeleteWarehouseZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: warehouseZoneApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouseZones.all });
      pushToast('success', TOAST_MESSAGES.DELETE_SUCCESS('Zone'));
    },
  });
}
