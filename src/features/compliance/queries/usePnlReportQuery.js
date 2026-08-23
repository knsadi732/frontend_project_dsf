import { useQuery } from '@tanstack/react-query';
import { financeReportsApi } from '@/features/compliance/api';
import { queryKeys } from '@/config/queryKeys';

export function usePnlReportQuery(range) {
  return useQuery({
    queryKey: queryKeys.financeReports.pnl(range),
    queryFn: () => financeReportsApi.pnl(range),
  });
}
