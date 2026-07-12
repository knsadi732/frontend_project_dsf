import { useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseZoneApi } from '@/features/warehouseZones/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateWarehouseZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: warehouseZoneApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouseZones.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Zone'));
    },
  });
}
