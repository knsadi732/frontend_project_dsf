import { useMutation, useQueryClient } from '@tanstack/react-query';
import { marketplaceSettlementApi } from '@/features/marketplaceSettlements/api';
import { pushToast } from '@/utils/toastBus';

export function useImportAmazonReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: marketplaceSettlementApi.importAmazonReports,
    onSuccess: (results) => {
      // An import touches the ledger, bills, returns, credit notes, GST and the dashboard — refresh it all.
      queryClient.invalidateQueries();
      const failed = results.filter((result) => !result.ok).length;
      pushToast(failed ? 'info' : 'success', failed ? `${results.length - failed} of ${results.length} reports imported` : 'Amazon reports imported');
    },
  });
}
