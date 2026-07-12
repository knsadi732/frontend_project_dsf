import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { getEmployeeFullName } from '@/utils/employeeName';

const ACTION_VARIANT = {
  login_success: 'success',
  login_failed: 'danger',
  logout: 'default',
  employee_created: 'info',
};

function formatDateTime(value) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AuditLogTable({ logs, employeesById, isLoading, page, pageSize, total, onPageChange, onPageSizeChange }) {
  const columns = [
    { key: 'createdAt', header: 'When', render: (row) => formatDateTime(row.createdAt) },
    { key: 'employee', header: 'Employee', render: (row) => employeesById?.[row.employeeId] ? getEmployeeFullName(employeesById[row.employeeId]) : row.employeeId ?? '—' },
    {
      key: 'action',
      header: 'Action',
      render: (row) => <BaseBadge variant={ACTION_VARIANT[row.action] ?? 'default'}>{row.action?.replace(/_/g, ' ')}</BaseBadge>,
    },
    { key: 'description', header: 'Description' },
    { key: 'device', header: 'Device' },
    { key: 'ipAddress', header: 'IP address' },
  ];

  return (
    <AppTable
      columns={columns}
      data={logs}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyMessage="No audit activity yet"
    />
  );
}
