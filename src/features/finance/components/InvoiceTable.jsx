import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function downloadInvoicePdf(row) {
  generateRecordPdf({
    title: `Invoice - ${row.invoiceNumber}`,
    fields: [
      { label: 'Party', value: row.party },
      { label: 'Linked SO', value: row.salesOrderNumber ?? '-' },
      { label: 'Amount', value: `Rs.${Number(row.amount).toLocaleString('en-IN')}` },
      { label: 'GST', value: row.gstAmount ? `${row.gstRate}% (Rs.${Number(row.gstAmount).toLocaleString('en-IN')})` : '-' },
      { label: 'Due Date', value: row.dueDate },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.invoiceNumber}.pdf`,
  });
}

export function InvoiceTable({
  invoices,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}) {
  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'party', header: 'Party' },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}`,
    },
    {
      key: 'gst',
      header: 'GST',
      render: (row) =>
        row.gstAmount ? `${row.gstRate}% (₹${Number(row.gstAmount).toLocaleString('en-IN')})` : '—',
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      render: (row) =>
        row.status === 'partial' && row.balanceDue != null
          ? `₹${Number(row.balanceDue).toLocaleString('en-IN')}`
          : '—',
    },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'linkedSo',
      header: 'Linked SO',
      render: (row) =>
        row.salesOrderNumber ? (
          <BaseBadge variant="info">{row.salesOrderNumber}</BaseBadge>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton label={`Download ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); downloadInvoicePdf(row); }} />
          <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.FINANCE} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={invoices}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No invoices yet"
    />
  );
}
