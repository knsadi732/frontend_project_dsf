import { Download, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
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
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>
      ),
    },
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
          <AppButton
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              downloadInvoicePdf(row);
            }}
            aria-label={`Download ${row.invoiceNumber}`}
          >
            <Download className="size-4" />
          </AppButton>
          <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              aria-label={`Edit ${row.invoiceNumber}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.FINANCE} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${row.invoiceNumber}`}
              className="text-danger hover:bg-danger/10"
            >
              <Trash2 className="size-4" />
            </AppButton>
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
