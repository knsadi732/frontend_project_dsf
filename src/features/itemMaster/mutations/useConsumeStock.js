import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemStockApi } from '@/features/itemMaster/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useConsumeStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: itemStockApi.consume,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.itemStock.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.itemStockMovements.all });
      pushToast('success', 'Stock consumption recorded.');
    },
  });
}
