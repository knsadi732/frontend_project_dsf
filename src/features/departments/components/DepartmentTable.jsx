import { Pencil, Trash2 } from 'lucide-react';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { STATUS_BADGE_VARIANT } from '@/constants/statusEnums';

export function DepartmentTable({
  departments,
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
    { key: 'name', header: 'Department', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={STATUS_BADGE_VARIANT[row.status] ?? 'default'}>{row.status}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(row); }} aria-label={`Edit ${row.name}`}>
              <Pencil className="size-4" />
            </AppButton>
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(row); }}
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
      data={departments}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No departments yet"
    />
  );
}
