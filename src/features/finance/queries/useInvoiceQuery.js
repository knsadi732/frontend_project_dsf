import { useQuery } from '@tanstack/react-query';
import { financeApi } from '@/features/finance/api';
import { queryKeys } from '@/config/queryKeys';

export function useInvoiceQuery(id) {
  return useQuery({
    queryKey: queryKeys.finance.detail(id),
    queryFn: () => financeApi.get(id),
    enabled: Boolean(id),
  });
}
