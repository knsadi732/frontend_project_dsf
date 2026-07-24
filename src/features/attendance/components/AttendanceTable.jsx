import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { getEmployeeFullName } from '@/utils/employeeName';

const STATUS_VARIANT = { present: 'success', absent: 'danger', half_day: 'warning', on_leave: 'info' };

export function AttendanceTable({ records, employeesById, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'employee', header: 'Employee', render: (row) => employeesById?.[row.employeeId] ? getEmployeeFullName(employeesById[row.employeeId]) : row.employeeId },
    { key: 'date', header: 'Date' },
    { key: 'checkIn', header: 'Check-in', render: (row) => row.checkIn || '—' },
    { key: 'checkOut', header: 'Check-out', render: (row) => row.checkOut || '—' },
    {
      key: 'flags',
      header: 'Flags',
      render: (row) => (
        <div className="flex gap-1">
          {row.lateEntry && <BaseBadge variant="warning">Late</BaseBadge>}
          {row.earlyExit && <BaseBadge variant="warning">Early exit</BaseBadge>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_VARIANT[row.status] ?? 'default'}>{row.status ?? 'present'}</BaseBadge>,
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
      emptyMessage="No attendance records yet"
    />
  );
}
