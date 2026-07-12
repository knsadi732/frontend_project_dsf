import { Check, Pencil, Trash2, X } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { getEmployeeFullName } from '@/utils/employeeName';

const STATUS_VARIANT = { pending: 'warning', approved: 'success', rejected: 'danger' };

export function LeaveTable({
  leaves,
  employeesById,
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
}) {
  const columns = [
    { key: 'employee', header: 'Employee', render: (row) => employeesById?.[row.employeeId] ? getEmployeeFullName(employeesById[row.employeeId]) : row.employeeId },
    { key: 'leaveType', header: 'Type', render: (row) => <span className="capitalize">{row.leaveType?.replace(/_/g, ' ')}</span> },
    { key: 'fromDate', header: 'From' },
    { key: 'toDate', header: 'To' },
    { key: 'reason', header: 'Reason' },
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
            <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onApprove(row); }} aria-label="Approve leave" className="text-success hover:bg-success/10">
                <Check className="size-4" />
              </AppButton>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onReject(row); }} aria-label="Reject leave" className="text-danger hover:bg-danger/10">
                <X className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }} aria-label="Edit leave">
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
              aria-label="Delete leave"
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
      data={leaves}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No leave requests yet"
    />
  );
}
