import { AppTable } from '@/components/ui/AppTable';
import { DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

export function CreditNoteTable({
  creditNotes,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onDelete,
}) {
  const columns = [
    { key: 'creditNoteNumber', header: 'Credit Note #' },
    { key: 'invoiceNumber', header: 'Invoice', render: (row) => row.invoiceNumber ?? '—' },
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    { key: 'gstAmount', header: 'GST Adjustment', render: (row) => `₹${Number(row.gstAmount ?? 0).toLocaleString('en-IN')}` },
    { key: 'createdDate', header: 'Date' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.FINANCE} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.creditNoteNumber}`} onClick={(event) => { event.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={creditNotes}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No credit notes yet"
    />
  );
}
