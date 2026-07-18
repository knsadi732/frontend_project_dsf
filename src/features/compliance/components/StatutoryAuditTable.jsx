import { AppTable } from '@/components/ui/AppTable';

export function StatutoryAuditTable({ audits, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'conductedAt', header: 'Conducted', render: (row) => new Date(row.conductedAt).toLocaleDateString('en-IN') },
    { key: 'auditorName', header: 'Auditor' },
    { key: 'findings', header: 'Findings', render: (row) => row.findings || '—' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
  ];

  return (
    <AppTable
      columns={columns}
      data={audits}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No statutory audits recorded yet"
    />
  );
}
