import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { vendorBillApi } from '@/features/vendorBills/api';
import { queryKeys } from '@/config/queryKeys';

export function useVendorBillsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.vendorBills.list(filters),
    queryFn: () => vendorBillApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
