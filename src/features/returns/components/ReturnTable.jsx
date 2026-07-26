import { Repeat } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AppButton } from '@/components/ui/AppButton';
import { EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { RETURN_REASON_OPTIONS, RETURN_STATUS } from '@/constants/statusEnums';

function reasonLabel(reason) {
  return RETURN_REASON_OPTIONS.find((option) => option.value === reason)?.label ?? reason;
}

export function ReturnTable({
  returns,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onConvertToReplacement,
}) {
  const columns = [
    { key: 'returnNumber', header: 'Return #' },
    { key: 'soNumber', header: 'Linked SO' },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <BaseBadge variant={row.type === 'customer' ? 'warning' : 'default'}>{row.type}</BaseBadge>
      ),
    },
    { key: 'quantity', header: 'Qty' },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}`,
    },
    { key: 'reason', header: 'Reason', render: (row) => reasonLabel(row.reason) },
    { key: 'createdDate', header: 'Date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === RETURN_STATUS.RESOLVED && row.resolutionType === 'replacement' && !row.replacementOrderId && (
            <Can module={MODULES.RETURNS} action={ACTIONS.EDIT}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  onConvertToReplacement(row);
                }}
                aria-label={`Convert ${row.returnNumber} to replacement order`}
                title="Convert to replacement order"
              >
                <Repeat className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.RETURNS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.returnNumber}`} onClick={(event) => { event.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.RETURNS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.returnNumber}`} onClick={(event) => { event.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={returns}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No returns yet"
    />
  );
}
