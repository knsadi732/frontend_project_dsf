import { FileOutput } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { ApproveButton, RejectButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
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
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'pending_approval' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
              <ApproveButton label="Approve PR" onClick={(e) => { e.stopPropagation(); onApprove(row); }} />
              <RejectButton label="Reject PR" onClick={(e) => { e.stopPropagation(); onReject(row); }} />
            </Can>
          )}
          {row.status === 'approved' && (
            <Can module={MODULES.PRODUCTION} action={ACTIONS.CREATE}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onConvertToWorkOrder(row); }} aria-label="Convert to work order" title="Convert to work order">
                <FileOutput className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.PRODUCTION} action={ACTIONS.EDIT}>
            <EditButton label="Edit PR" onClick={(e) => { e.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.PRODUCTION} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete PR" onClick={(e) => { e.stopPropagation(); onDelete(row); }} />
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
