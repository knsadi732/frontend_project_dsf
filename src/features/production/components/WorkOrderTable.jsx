import { Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';

export function WorkOrderTable({ workOrders, isLoading, page, pageSize, total, onPageChange, onEdit, onDelete }) {
  const columns = [
    { key: 'workOrderNumber', header: 'Work Order #' },
    { key: 'product', header: 'Product' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'dueDate', header: 'Due Date' },
    {
      key: 'stage',
      header: 'Stage',
      render: (row) => (
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.stage] ?? 'default'}>{row.stage}</BaseBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row)}
              aria-label={`Edit ${row.workOrderNumber}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.PRODUCTION} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
              aria-label={`Delete ${row.workOrderNumber}`}
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
      data={workOrders}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      emptyMessage="No work orders yet"
    />
  );
}
