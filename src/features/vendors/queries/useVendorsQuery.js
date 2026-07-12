import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { vendorApi } from '@/features/vendors/api';
import { queryKeys } from '@/config/queryKeys';

export function useVendorsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.vendors.list(filters),
    queryFn: () => vendorApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
