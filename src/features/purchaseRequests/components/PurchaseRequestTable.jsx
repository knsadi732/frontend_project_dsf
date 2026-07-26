import { Check, FileOutput, Send, SendHorizonal, X } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';

const STATUS_VARIANT = {
  draft: 'default',
  submitted: 'warning',
  pending_approval: 'warning',
  pending: 'warning',
  approved: 'success',
  converted_to_rfq: 'success',
  rejected: 'danger',
};

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
  onSubmitRequest,
  onSendForApproval,
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
          {row.status === 'draft' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
              <AppButton variant="primary" size="sm" title="Submit PR" onClick={(e) => { e.stopPropagation(); onSubmitRequest(row); }} aria-label="Submit PR">
                <Send className="size-4" />
              </AppButton>
            </Can>
          )}
          {row.status === 'submitted' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
              <AppButton variant="info" size="sm" title="Send for approval" onClick={(e) => { e.stopPropagation(); onSendForApproval(row); }} aria-label="Send for approval">
                <SendHorizonal className="size-4" />
              </AppButton>
            </Can>
          )}
          {row.status === 'pending_approval' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
              <AppButton variant="success" size="sm" title="Approve PR" onClick={(e) => { e.stopPropagation(); onApprove(row); }} aria-label="Approve PR">
                <Check className="size-4" />
              </AppButton>
              <AppButton variant="danger" size="sm" title="Reject PR" onClick={(e) => { e.stopPropagation(); onReject(row); }} aria-label="Reject PR">
                <X className="size-4" />
              </AppButton>
            </Can>
          )}
          {row.status === 'approved' && (
            <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
              <AppButton variant="info" size="sm" title="Convert to Purchase Order" onClick={(e) => { e.stopPropagation(); onConvertToPo(row); }} aria-label="Convert to PO">
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
