import { useQuery } from '@tanstack/react-query';
import { financeReportsApi } from '@/features/compliance/api';
import { queryKeys } from '@/config/queryKeys';

export function useGstr2bProxyQuery(range) {
  return useQuery({
    queryKey: queryKeys.financeReports.gstr2bProxy(range),
    queryFn: () => financeReportsApi.gstr2bProxy(range),
  });
}
