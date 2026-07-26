import { Eye } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { getEmployeeFullName } from '@/utils/employeeName';

export function UserTable({
  users,
  departmentsById,
  rolesById,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onView,
  onEdit,
  onDelete,
}) {
  const columns = [
    {
      key: 'employeeCode',
      header: 'Code',
      render: (row) => <span className="text-xs font-medium text-text-muted">{row.employeeCode}</span>,
    },
    {
      key: 'user',
      header: 'Employee',
      render: (row) => (
        <div className="flex items-center gap-3">
          <BaseAvatar name={getEmployeeFullName(row)} src={row.photo} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-text">{getEmployeeFullName(row)}</span>
            <span className="text-xs text-text-muted">{row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span className="text-text-muted">{departmentsById?.[row.departmentId]?.name ?? row.departmentName ?? '—'}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <BaseBadge variant="info">{rolesById?.[row.primaryRole]?.name ?? row.primaryRole}</BaseBadge>
          {row.additionalRoles?.map((role) => (
            <BaseBadge key={role} variant="default">
              {rolesById?.[role]?.name ?? role}
            </BaseBadge>
          ))}
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.employmentStatus} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onView(row);
            }}
            aria-label={`View ${getEmployeeFullName(row)}`}
            title="View"
          >
            <Eye className="size-4" />
          </AppButton>
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${getEmployeeFullName(row)}`} onClick={(event) => { event.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${getEmployeeFullName(row)}`} onClick={(event) => { event.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onView}
      emptyMessage="No employees yet"
    />
  );
}
