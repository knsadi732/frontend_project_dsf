import { useState } from 'react';
import { useAuditLogsQuery } from '@/features/auditLogs/queries/useAuditLogsQuery';
import { AuditLogTable } from '@/features/auditLogs/components/AuditLogTable';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function AuditLogsPanel({ employeesById }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useAuditLogsQuery({ page, pageSize });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">System activity: logins, logouts, and record changes.</p>

      <AuditLogTable
        logs={data?.data ?? []}
        employeesById={employeesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
