import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/features/inventory/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => inventoryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      pushToast('success', TOAST_MESSAGES.UPDATE_SUCCESS('Inventory item'));
    },
  });
}
