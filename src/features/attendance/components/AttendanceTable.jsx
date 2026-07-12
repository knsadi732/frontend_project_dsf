import { Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { getEmployeeFullName } from '@/utils/employeeName';

const STATUS_VARIANT = { present: 'success', absent: 'danger', half_day: 'warning', on_leave: 'info' };

export function AttendanceTable({
  records,
  employeesById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
}) {
  const columns = [
    { key: 'employee', header: 'Employee', render: (row) => employeesById?.[row.employeeId] ? getEmployeeFullName(employeesById[row.employeeId]) : row.employeeId },
    { key: 'date', header: 'Date' },
    { key: 'shift', header: 'Shift' },
    { key: 'checkIn', header: 'Check-in', render: (row) => row.checkIn || '—' },
    { key: 'checkOut', header: 'Check-out', render: (row) => row.checkOut || '—' },
    { key: 'totalHours', header: 'Hours' },
    {
      key: 'flags',
      header: 'Flags',
      render: (row) => (
        <div className="flex gap-1">
          {row.lateEntry && <BaseBadge variant="warning">Late</BaseBadge>}
          {row.earlyExit && <BaseBadge variant="warning">Early exit</BaseBadge>}
          {Number(row.overtimeHours) > 0 && <BaseBadge variant="info">OT {row.overtimeHours}h</BaseBadge>}
        </div>
      ),
    },
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
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }} aria-label="Edit attendance">
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
              aria-label="Delete attendance"
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
      data={records}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No attendance records yet"
    />
  );
}
