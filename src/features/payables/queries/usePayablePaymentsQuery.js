import { useQuery } from '@tanstack/react-query';
import { payableApi } from '@/features/payables/api';
import { queryKeys } from '@/config/queryKeys';

export function usePayablePaymentsQuery(payableId) {
  return useQuery({
    queryKey: [...queryKeys.payables.detail(payableId), 'payments'],
    queryFn: () => payableApi.listPayments(payableId),
    enabled: Boolean(payableId),
  });
}
