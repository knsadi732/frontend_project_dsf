import { useQuery } from '@tanstack/react-query';
import { financeReportsApi } from '@/features/compliance/api';
import { queryKeys } from '@/config/queryKeys';

export function useGstr1ReportQuery(range) {
  return useQuery({
    queryKey: queryKeys.financeReports.gstr1(range),
    queryFn: () => financeReportsApi.gstr1(range),
  });
}
