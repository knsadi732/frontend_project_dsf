import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { financeApi } from '@/features/finance/api';
import { queryKeys } from '@/config/queryKeys';

export function useInvoicesQuery(filters) {
  return useQuery({
    queryKey: queryKeys.finance.list(filters),
    queryFn: () => financeApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
