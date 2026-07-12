import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { communicationLogApi } from '@/features/communicationLogs/api';
import { queryKeys } from '@/config/queryKeys';

export function useCommunicationLogsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.communicationLogs.list(filters),
    queryFn: () => communicationLogApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
