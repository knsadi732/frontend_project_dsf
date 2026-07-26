import { useState } from 'react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton } from '@/components/ui/ActionButtons';
import { reportApi } from '@/features/reports/api';
import { pushToast } from '@/utils/toastBus';

const STATUS_VARIANT = { ready: 'success', pending: 'warning', failed: 'danger' };

export function ReportTable({ reports, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (row) => {
    setDownloadingId(row.id);
    try {
      const blob = await reportApi.download(row.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = row.name;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      pushToast('error', 'Failed to download report');
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <BaseBadge variant="info">{row.type}</BaseBadge>,
    },
    {
      key: 'generatedAt',
      header: 'Generated At',
      render: (row) => new Date(row.generatedAt).toLocaleString(),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'ready' && (
          <div className="flex justify-end">
            <DownloadButton
              label={`Download ${row.name}`}
              loading={downloadingId === row.id}
              onClick={() => handleDownload(row)}
            />
          </div>
        ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={reports}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No reports yet"
    />
  );
}
