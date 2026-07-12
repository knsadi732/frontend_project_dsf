import { Check, FileOutput, Pencil, Trash2, X } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = {
  draft: 'default',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'danger',
  converted_to_production_order: 'success',
};

export function ProductionRequestTable({
  requests,
  productsById,
  warehousesById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onConvertToWorkOrder,
}) {
  const columns = [
    { key: 'prNumber', header: 'PR Number' },
    { key: 'product', header: 'Product', render: (row) => productsById?.[row.productId]?.name ?? '—' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'requiredDate', header: 'Required date' },
    { key: 'priority', header: 'Priority', render: (row) => <span className="capitalize">{row.priority}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_VARIANT[row.status] ?? 'default'}>{row.status?.replace(/_/g, ' ')}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'pending_approval' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onApprove(row); }} aria-label="Approve PR" className="text-success hover:bg-success/10">
                <Check className="size-4" />
              </AppButton>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onReject(row); }} aria-label="Reject PR" className="text-danger hover:bg-danger/10">
                <X className="size-4" />
              </AppButton>
            </Can>
          )}
          {row.status === 'approved' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onConvertToWorkOrder(row); }} aria-label="Convert to work order">
                <FileOutput className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }} aria-label="Edit PR">
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.PRODUCTION} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
              aria-label="Delete PR"
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
      data={requests}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No production requests yet"
    />
  );
}
