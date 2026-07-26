import { useMemo, useState } from 'react';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useCreateCustomer } from '@/features/customers/mutations/useCreateCustomer';
import { useUpdateCustomer } from '@/features/customers/mutations/useUpdateCustomer';
import { useDeleteCustomer } from '@/features/customers/mutations/useDeleteCustomer';
import { CustomerFormModal } from '@/features/customers/components/CustomerFormModal';
import { CustomerCommunicationsPanel } from '@/features/customerCommunications';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const TABS = [
  { key: 'customers', label: 'Customers' },
  { key: 'communications', label: 'Communication History' },
];

export function CustomersPage() {
  const [activeTab, setActiveTab] = useState('customers');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, customer: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(() => ({ search: debouncedSearch, page, pageSize }), [debouncedSearch, page, pageSize]);

  const { data, isLoading, isFetching, refetch } = useCustomersQuery(filters);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const handleSubmit = (values) => {
    const action = formState.customer
      ? updateCustomer.mutateAsync({ id: formState.customer.id, payload: values })
      : createCustomer.mutateAsync(values);

    action.then(() => setFormState({ open: false, customer: null }));
  };

  const handleConfirmDelete = () => {
    deleteCustomer.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-medium text-text">{row.name}</span> },
    { key: 'customerType', header: 'Type', render: (row) => <span className="capitalize">{row.customerType}</span> },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    { key: 'gstNumber', header: 'GST Number' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.CUSTOMERS} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.name}`} onClick={(e) => { e.stopPropagation(); setFormState({ open: true, customer: row }); }} />
          </Can>
          <Can module={MODULES.CUSTOMERS} action={ACTIONS.DELETE}>
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
          <h1 className="text-xl font-semibold text-text">Customers</h1>
          <p className="text-sm text-text-muted">Manage your customer accounts.</p>
        </div>
        {activeTab === 'customers' && (
          <Can module={MODULES.CUSTOMERS} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, customer: null })}>New customer</CreateButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'customers' && (
        <>
      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search customers…"
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
        onRowClick={(customer) => setFormState({ open: true, customer })}
        emptyMessage="No customers yet"
      />

      <CustomerFormModal
        open={formState.open}
        initialValues={formState.customer}
        onClose={() => setFormState({ open: false, customer: null })}
        onSubmit={handleSubmit}
        isSubmitting={createCustomer.isPending || updateCustomer.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete customer"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteCustomer.isPending} onClick={handleConfirmDelete}>
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
        </>
      )}

      {activeTab === 'communications' && <CustomerCommunicationsPanel />}
    </div>
  );
}
