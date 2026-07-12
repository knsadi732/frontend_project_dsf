import { useState } from 'react';
import { useCommunicationLogsQuery } from '@/features/communicationLogs/queries/useCommunicationLogsQuery';
import { CommunicationLogTable } from '@/features/communicationLogs/components/CommunicationLogTable';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function CommunicationLogsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useCommunicationLogsQuery({ page, pageSize });

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">Every business event and its simulated in-app/email delivery, logged automatically.</p>

      <CommunicationLogTable
        logs={data?.data ?? []}
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
