import { useQuery } from '@tanstack/react-query';
import { companyApi } from '@/features/company/api';
import { queryKeys } from '@/config/queryKeys';

export function useCompanyQuery() {
  return useQuery({
    queryKey: queryKeys.company.detail('1'),
    queryFn: () => companyApi.get('1'),
  });
}
