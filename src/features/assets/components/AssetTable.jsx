import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { getEmployeeFullName } from '@/utils/employeeName';

export function AssetTable({
  assets,
  employeesById,
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
    { key: 'employee', header: 'Employee', render: (row) => employeesById?.[row.employeeId] ? getEmployeeFullName(employeesById[row.employeeId]) : row.employeeId },
    { key: 'assetType', header: 'Type', render: (row) => <span className="capitalize">{row.assetType?.replace(/_/g, ' ')}</span> },
    { key: 'assetName', header: 'Asset' },
    { key: 'serialNumber', header: 'Serial number' },
    { key: 'assignedDate', header: 'Assigned' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={row.status === 'assigned' ? 'info' : 'default'}>{row.status}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.USERS} action={ACTIONS.EDIT}>
            <EditButton label="Edit asset" onClick={(e) => { e.stopPropagation(); onEdit(row); }} />
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete asset" onClick={(e) => { e.stopPropagation(); onDelete(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <AppTable
      columns={columns}
      data={assets}
      isLoading={isLoading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      onRowClick={onEdit}
      emptyMessage="No assets assigned yet"
    />
  );
}
