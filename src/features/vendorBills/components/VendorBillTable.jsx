import { CreditCard } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = { pending: 'warning', partial: 'warning', paid: 'success', overdue: 'danger' };

export function VendorBillTable({
  bills,
  vendorsById,
  purchaseOrdersById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onRecordPayment,
}) {
  const columns = [
    { key: 'billNumber', header: 'Bill Number' },
    { key: 'vendor', header: 'Vendor', render: (row) => vendorsById?.[row.vendorId]?.name ?? '—' },
    { key: 'po', header: 'Purchase Order', render: (row) => purchaseOrdersById?.[row.purchaseOrderId]?.poNumber ?? '—' },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    { key: 'balanceDue', header: 'Balance due', render: (row) => `₹${Number(row.balanceDue ?? row.amount).toLocaleString('en-IN')}` },
    { key: 'dueDate', header: 'Due date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status ?? 'pending'} variantMap={STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status !== 'paid' && (
            <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onRecordPayment(row); }} aria-label="Record payment" title="Record payment">
                <CreditCard className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.FINANCE} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete bill" onClick={(e) => { e.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={bills}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No vendor bills yet"
    />
  );
}
