import { Check, FileOutput, X } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' };

export function PurchaseRequestTable({
  requests,
  departmentsById,
  warehousesById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onApprove,
  onReject,
  onConvertToPo,
}) {
  const columns = [
    { key: 'prNumber', header: 'PR Number' },
    { key: 'department', header: 'Department', render: (row) => departmentsById?.[row.departmentId]?.name ?? '—' },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'items', header: 'Items', render: (row) => row.items?.length ?? 0 },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'pending' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onApprove(row); }} aria-label="Approve PR" className="text-success hover:bg-success/10">
                <Check className="size-4" />
              </AppButton>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onReject(row); }} aria-label="Reject PR" className="text-danger hover:bg-danger/10">
                <X className="size-4" />
              </AppButton>
            </Can>
          )}
          {row.status === 'approved' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onConvertToPo(row); }} aria-label="Convert to PO">
                <FileOutput className="size-4" />
              </AppButton>
            </Can>
          )}
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
      emptyMessage="No purchase requests yet"
    />
  );
}
