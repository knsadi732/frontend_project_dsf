import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { paymentApi } from '@/features/payments/api';
import { queryKeys } from '@/config/queryKeys';

export function usePaymentsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.payments.list(filters),
    queryFn: () => paymentApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
