import { useState } from 'react';
import { useBrandsQuery } from '@/features/brands/queries/useBrandsQuery';
import { useCreateBrand } from '@/features/brands/mutations/useCreateBrand';
import { useUpdateBrand } from '@/features/brands/mutations/useUpdateBrand';
import { useDeleteBrand } from '@/features/brands/mutations/useDeleteBrand';
import { BrandFormModal } from '@/features/brands/components/BrandFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function BrandsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, brand: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading, isFetching, refetch } = useBrandsQuery({ page, pageSize });
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const handleSubmit = (values) => {
    const action = formState.brand
      ? updateBrand.mutateAsync({ id: formState.brand.id, payload: values })
      : createBrand.mutateAsync(values);

    action.then(() => setFormState({ open: false, brand: null }));
  };

  const handleConfirmDelete = () => {
    deleteBrand.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'name', header: 'Brand', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'country', header: 'Country' },
    { key: 'description', header: 'Description' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.PRODUCTS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, brand: row }); }} />
          </Can>
          <Can module={MODULES.PRODUCTS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.name}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Every product belongs to one brand.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.PRODUCTS} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, brand: null })}>New brand</CreateButton>
          </Can>
        </div>
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
        onRowClick={(brand) => setFormState({ open: true, brand })}
        emptyMessage="No brands yet"
      />

      <BrandFormModal
        open={formState.open}
        initialValues={formState.brand}
        onClose={() => setFormState({ open: false, brand: null })}
        onSubmit={handleSubmit}
        isSubmitting={createBrand.isPending || updateBrand.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete brand"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteBrand.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.name}</span>? This
          action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
