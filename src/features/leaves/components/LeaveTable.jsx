import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ApproveButton, RejectButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
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
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === 'pending' && (
            <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
              <ApproveButton label="Approve leave" onClick={(e) => { e.stopPropagation(); onApprove(row); }} />
              <RejectButton label="Reject leave" onClick={(e) => { e.stopPropagation(); onReject(row); }} />
            </Can>
          )}
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label="Edit leave" onClick={(e) => { e.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete leave" onClick={(e) => { e.stopPropagation(); onDelete(row); }} />
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
