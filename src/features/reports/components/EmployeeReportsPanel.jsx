import { useMemo } from 'react';
import { useUsersQuery } from '@/features/users/queries/useUsersQuery';
import { useDepartmentsQuery } from '@/features/departments/queries/useDepartmentsQuery';
import { useAttendanceQuery } from '@/features/attendance/queries/useAttendanceQuery';
import { useLeavesQuery } from '@/features/leaves/queries/useLeavesQuery';
import { ReportSection } from '@/features/reports/components/ReportSection';
import { attendanceSummary } from '@/features/reports/utils/reportAggregations';
import { getEmployeeFullName } from '@/utils/employeeName';

export function EmployeeReportsPanel() {
  const { data: usersData } = useUsersQuery({ pageSize: 200 });
  const { data: departmentsData } = useDepartmentsQuery({ pageSize: 100 });
  const { data: attendanceData } = useAttendanceQuery({ pageSize: 500 });
  const { data: leavesData } = useLeavesQuery({ pageSize: 500 });

  const users = usersData?.data ?? [];
  const attendance = attendanceData?.data ?? [];
  const leaves = leavesData?.data ?? [];
  const departmentsById = useMemo(
    () => Object.fromEntries((departmentsData?.data ?? []).map((d) => [d.id, d])),
    [departmentsData],
  );
  const usersById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);

  const attendanceRows = useMemo(() => attendanceSummary(attendance, usersById), [attendance, usersById]);
  const leaveRows = useMemo(
    () => leaves.map((leave) => ({ ...leave, employeeName: getEmployeeFullName(usersById[leave.employeeId]) || leave.employeeId })),
    [leaves, usersById],
  );

  return (
    <div className="flex flex-col gap-4">
      <ReportSection
        title="Employee Register"
        description="Every employee, role and department."
        fileName="employee-register"
        columns={[
          { key: 'employeeCode', header: 'Code' },
          { key: 'name', header: 'Name', format: (row) => getEmployeeFullName(row) },
          { key: 'primaryRole', header: 'Primary Role' },
          { key: 'departmentId', header: 'Department', format: (row) => departmentsById[row.departmentId]?.name ?? '—' },
          { key: 'employmentStatus', header: 'Status' },
        ]}
        rows={users}
      />

      <ReportSection
        title="Attendance Report"
        description="Present days, on-leave days and late entries per employee."
        fileName="attendance-report"
        columns={[
          { key: 'employeeName', header: 'Employee' },
          { key: 'present', header: 'Present days' },
          { key: 'onLeave', header: 'On-leave days' },
          { key: 'lateEntry', header: 'Late entries' },
        ]}
        rows={attendanceRows}
      />

      <ReportSection
        title="Leave Report"
        description="Every leave request and its status."
        fileName="leave-report"
        columns={[
          { key: 'employeeName', header: 'Employee' },
          { key: 'leaveType', header: 'Type' },
          { key: 'fromDate', header: 'From' },
          { key: 'toDate', header: 'To' },
          { key: 'status', header: 'Status' },
        ]}
        rows={leaveRows}
      />
    </div>
  );
}
