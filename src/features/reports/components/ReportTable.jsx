import { useState } from 'react';
import { Download } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { reportApi } from '@/features/reports/api';
import { pushToast } from '@/utils/toastBus';

const STATUS_VARIANT = { ready: 'success', pending: 'warning', failed: 'danger' };

export function ReportTable({ reports, isLoading, page, pageSize, total, onPageChange }) {
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
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'ready' && (
          <div className="flex justify-end">
            <AppButton
              variant="ghost"
              size="sm"
              loading={downloadingId === row.id}
              onClick={() => handleDownload(row)}
              aria-label={`Download ${row.name}`}
            >
              <Download className="size-4" />
            </AppButton>
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
      emptyMessage="No reports yet"
    />
  );
}
