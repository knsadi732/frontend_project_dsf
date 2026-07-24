import { useMemo } from 'react';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { AttendancePanel } from '@/features/attendance/pages/AttendancePanel';
import { getEmployeeFullName } from '@/utils/employeeName';

export function AttendancePage() {
  const { data: usersData } = useUsersQuery({ pageSize: 200 });
  const users = useMemo(() => usersData?.data ?? [], [usersData]);
  const employeesById = useMemo(() => Object.fromEntries(users.map((user) => [user.id, user])), [users]);
  const employeeOptions = useMemo(
    () => users.map((user) => ({ value: user.id, label: getEmployeeFullName(user) })),
    [users],
  );

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Attendance</h1>
        <p className="text-sm text-text-muted">Daily check-in log, marked automatically at login.</p>
      </div>

      <AttendancePanel employeesById={employeesById} employeeOptions={employeeOptions} />
    </div>
  );
}
