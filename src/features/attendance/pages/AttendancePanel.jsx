import { useState } from 'react';
import { useAttendanceQuery } from '@/features/attendance/queries/useAttendanceQuery';
import { AttendanceTable } from '@/features/attendance/components/AttendanceTable';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

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

      <AttendanceTable
        records={data?.data ?? []}
        employeesById={employeesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
