import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { customerCommunicationApi } from '@/features/customerCommunications/api';
import { queryKeys } from '@/config/queryKeys';

export function useCustomerCommunicationsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.customerCommunications.list(filters),
    queryFn: () => customerCommunicationApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
