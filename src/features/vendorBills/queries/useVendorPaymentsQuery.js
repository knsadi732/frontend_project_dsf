import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { vendorPaymentApi } from '@/services/vendorPayment.api';
import { queryKeys } from '@/config/queryKeys';

export function useVendorPaymentsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.vendorPayments.list(filters),
    queryFn: () => vendorPaymentApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
