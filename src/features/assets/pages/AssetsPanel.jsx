import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAssetsQuery } from '@/features/assets/queries/useAssetsQuery';
import { useCreateAsset } from '@/features/assets/mutations/useCreateAsset';
import { useUpdateAsset } from '@/features/assets/mutations/useUpdateAsset';
import { useDeleteAsset } from '@/features/assets/mutations/useDeleteAsset';
import { AssetFormModal } from '@/features/assets/components/AssetFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { getEmployeeFullName } from '@/utils/employeeName';

export function AssetsPanel({ employeesById, employeeOptions }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, asset: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useAssetsQuery({ page, pageSize });
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const deleteAsset = useDeleteAsset();

  const handleSubmit = (values) => {
    const action = formState.asset
      ? updateAsset.mutateAsync({ id: formState.asset.id, payload: values })
      : createAsset.mutateAsync(values);

    action.then(() => setFormState({ open: false, asset: null }));
  };

  const handleConfirmDelete = () => {
    deleteAsset.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

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
            <EditButton label="Edit asset" onClick={(e) => { e.stopPropagation(); setFormState({ open: true, asset: row }); }} />
          </Can>
          <Can module={MODULES.USERS} action={ACTIONS.DELETE}>
            <DeleteButton label="Delete asset" onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Company assets assigned to employees.</p>
        <Can module={MODULES.USERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormState({ open: true, asset: null })}>
            <Plus className="size-4" />
            New assignment
          </AppButton>
        </Can>
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
        onRowClick={(asset) => setFormState({ open: true, asset })}
        emptyMessage="No assets assigned yet"
      />

      <AssetFormModal
        open={formState.open}
        initialValues={formState.asset}
        employeeOptions={employeeOptions}
        onClose={() => setFormState({ open: false, asset: null })}
        onSubmit={handleSubmit}
        isSubmitting={createAsset.isPending || updateAsset.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete asset"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteAsset.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">Are you sure you want to delete this asset record? This action cannot be undone.</p>
      </AppModal>
    </div>
  );
}
