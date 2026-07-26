import { useMemo, useState } from 'react';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { useCreateVendor } from '@/features/vendors/mutations/useCreateVendor';
import { useUpdateVendor } from '@/features/vendors/mutations/useUpdateVendor';
import { useDeleteVendor } from '@/features/vendors/mutations/useDeleteVendor';
import { vendorApi } from '@/features/vendors/api';
import { VendorFormModal } from '@/features/vendors/components/VendorFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function VendorsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, vendor: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(() => ({ search: debouncedSearch, page, pageSize }), [debouncedSearch, page, pageSize]);

  const { data, isLoading, isFetching, refetch } = useVendorsQuery(filters);
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const handleSubmit = (values) => {
    const action = formState.vendor
      ? updateVendor.mutateAsync({ id: formState.vendor.id, payload: values })
      : createVendor.mutateAsync(values);

    action.then(() => setFormState({ open: false, vendor: null }));
  };

  // Edit always re-fetches the single vendor (GET /vendors/:id) instead of
  // reusing the row from the list query, so the form shows exactly what
  // the backend has right now rather than a possibly-stale list snapshot.
  const handleEdit = (vendor) => {
    vendorApi.get(vendor.id).then((full) => setFormState({ open: true, vendor: full }));
  };

  const handleConfirmDelete = () => {
    deleteVendor.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'vendorType', header: 'Type', render: (row) => <span className="capitalize">{row.vendorType?.replace(/_/g, ' ')}</span> },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'gstNumber', header: 'GST Number' },
    { key: 'qualityRating', header: 'Quality Rating', render: (row) => (row.qualityRating ? '★'.repeat(row.qualityRating) : '—') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.VENDORS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); handleEdit(row); }} />
          </Can>
          <Can module={MODULES.VENDORS} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.name}`} onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Vendors</h1>
          <p className="text-sm text-text-muted">Manage your supplier accounts.</p>
        </div>
        <Can module={MODULES.VENDORS} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, vendor: null })}>New vendor</CreateButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search vendors…"
          className="w-72"
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

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
        onRowClick={handleEdit}
        emptyMessage="No vendors yet"
      />

      <VendorFormModal
        open={formState.open}
        initialValues={formState.vendor}
        onClose={() => setFormState({ open: false, vendor: null })}
        onSubmit={handleSubmit}
        isSubmitting={createVendor.isPending || updateVendor.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete vendor"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteVendor.isPending} onClick={handleConfirmDelete}>
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
