import { Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';

export function SalesOrderTable({ salesOrders, isLoading, page, pageSize, total, onPageChange, onEdit, onDelete }) {
  const columns = [
    { key: 'soNumber', header: 'SO Number' },
    { key: 'customer', header: 'Customer' },
    { key: 'orderDate', header: 'Order Date' },
    {
      key: 'total',
      header: 'Total',
      render: (row) => `₹${Number(row.total).toLocaleString('en-IN')}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={() => onEdit(row)} aria-label={`Edit ${row.soNumber}`}>
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.SALES} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
              aria-label={`Delete ${row.soNumber}`}
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
      data={salesOrders}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      emptyMessage="No sales orders yet"
    />
  );
}
