import { useQuery } from '@tanstack/react-query';
import { salesApi } from '@/features/sales/api';
import { queryKeys } from '@/config/queryKeys';

export function useSalesOrderQuery(id) {
  return useQuery({
    queryKey: queryKeys.sales.detail(id),
    queryFn: () => salesApi.get(id),
    enabled: Boolean(id),
  });
}
