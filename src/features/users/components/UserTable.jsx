import { Eye, Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';
import { getEmployeeFullName } from '@/utils/employeeName';

export function UserTable({ users, departmentsById, isLoading, page, pageSize, total, onPageChange, onView, onEdit, onDelete }) {
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
      render: (row) => <span className="text-text-muted">{departmentsById?.[row.departmentId]?.name ?? '—'}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <BaseBadge variant="info">{row.role}</BaseBadge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.employmentStatus] ?? 'default'}>{row.employmentStatus}</BaseBadge>
      ),
    },
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
          >
            <Eye className="size-4" />
          </AppButton>
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(row);
              }}
              aria-label={`Edit ${getEmployeeFullName(row)}`}
            >
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(row);
              }}
              aria-label={`Delete ${getEmployeeFullName(row)}`}
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
      data={users}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onRowClick={onView}
      emptyMessage="No employees yet"
    />
  );
}
