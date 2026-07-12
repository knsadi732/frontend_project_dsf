import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { customerApi } from '@/features/customers/api';
import { queryKeys } from '@/config/queryKeys';

export function useCustomersQuery(filters) {
  return useQuery({
    queryKey: queryKeys.customers.list(filters),
    queryFn: () => customerApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
