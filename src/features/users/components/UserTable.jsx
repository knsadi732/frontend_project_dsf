import { Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { BaseAvatar } from '@/components/ui/BaseAvatar';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';

export function UserTable({ users, isLoading, page, pageSize, total, onPageChange, onEdit, onDelete }) {
  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <BaseAvatar name={row.name} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-text">{row.name}</span>
            <span className="text-xs text-text-muted">{row.email}</span>
          </div>
        </div>
      ),
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
        <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={() => onEdit(row)} aria-label={`Edit ${row.name}`}>
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row)}
              aria-label={`Delete ${row.name}`}
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
      emptyMessage="No users yet"
    />
  );
}
