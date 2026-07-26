import { useState } from 'react';
import { useAttendanceQuery } from '@/features/attendance/queries/useAttendanceQuery';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { getEmployeeFullName } from '@/utils/employeeName';

const ATTENDANCE_STATUS_VARIANT = { present: 'success', absent: 'danger', half_day: 'warning', on_leave: 'info' };

// Read-only: the backend has no create/update/delete for attendance, only
// GET /attendance. Records are created automatically on login (see
// useLoginMutation), so this panel is a filterable log, not a CRUD screen.
export function AttendancePanel({ employeesById, employeeOptions }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [employeeId, setEmployeeId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useAttendanceQuery({
    page,
    pageSize,
    employeeId: employeeId || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

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
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status ?? 'present'} variantMap={ATTENDANCE_STATUS_VARIANT} /> },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-4">
        <AppSelect
          label="Employee"
          placeholder="All employees"
          options={employeeOptions}
          value={employeeId}
          onChange={(e) => {
            setEmployeeId(e.target.value);
            setPage(1);
          }}
        />
        <AppInput
          label="From"
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(1);
          }}
        />
        <AppInput
          label="To"
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <AppTable
        columns={columns}
        data={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        emptyMessage="No attendance records yet"
      />
    </div>
  );
}
