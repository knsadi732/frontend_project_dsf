import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/features/inventory/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';
import { TOAST_MESSAGES } from '@/constants/toastMessages';

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      pushToast('success', TOAST_MESSAGES.CREATE_SUCCESS('Inventory item'));
    },
  });
}
