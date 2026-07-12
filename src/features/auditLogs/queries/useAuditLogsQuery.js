import { useQuery } from '@tanstack/react-query';
import { auditLogApi } from '@/features/auditLogs/api';
import { queryKeys } from '@/config/queryKeys';

export function useAuditLogsQuery(filters) {
  return useQuery({
    queryKey: queryKeys.auditLogs.list(filters),
    queryFn: () => auditLogApi.list(filters),
    refetchOnMount: 'always',
  });
}
