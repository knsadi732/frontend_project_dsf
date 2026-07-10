import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { salesApi } from '@/features/sales/api';
import { queryKeys } from '@/config/queryKeys';

export function useSalesOrdersQuery(filters) {
  return useQuery({
    queryKey: queryKeys.sales.list(filters),
    queryFn: () => salesApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
