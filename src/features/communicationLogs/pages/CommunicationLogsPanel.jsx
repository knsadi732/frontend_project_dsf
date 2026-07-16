import { useMemo, useState } from 'react';
import { useCommunicationLogsQuery } from '@/features/communicationLogs/queries/useCommunicationLogsQuery';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { CommunicationLogTable } from '@/features/communicationLogs/components/CommunicationLogTable';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function CommunicationLogsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading } = useCommunicationLogsQuery({ page, pageSize });
  const { data: salesData } = useSalesOrdersQuery({ pageSize: 500 });
  const salesOrdersById = useMemo(
    () => Object.fromEntries((salesData?.data ?? []).map((so) => [so.id, so])),
    [salesData],
  );

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">
        Every business event and its delivery — Sales Order events show the order's real fulfillment stage; other events show simulated in-app/email delivery.
      </p>

      <CommunicationLogTable
        logs={data?.data ?? []}
        salesOrdersById={salesOrdersById}
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
