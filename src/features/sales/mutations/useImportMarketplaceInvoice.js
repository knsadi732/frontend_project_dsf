import { useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '@/features/sales/api';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

export function useImportMarketplaceInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesApi.importMarketplaceInvoice,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sales.all });
      pushToast('success', `Order ${order.order_number ?? order.orderNumber} created from marketplace invoice`);
    },
  });
}
