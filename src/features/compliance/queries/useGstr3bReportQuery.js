import { useQuery } from '@tanstack/react-query';
import { financeReportsApi } from '@/features/compliance/api';
import { queryKeys } from '@/config/queryKeys';

export function useGstr3bReportQuery(range) {
  return useQuery({
    queryKey: queryKeys.financeReports.gstr3b(range),
    queryFn: () => financeReportsApi.gstr3b(range),
  });
}
