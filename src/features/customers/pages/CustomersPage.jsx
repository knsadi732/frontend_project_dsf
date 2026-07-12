import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useCreateCustomer } from '@/features/customers/mutations/useCreateCustomer';
import { useUpdateCustomer } from '@/features/customers/mutations/useUpdateCustomer';
import { useDeleteCustomer } from '@/features/customers/mutations/useDeleteCustomer';
import { CustomerTable } from '@/features/customers/components/CustomerTable';
import { CustomerFormModal } from '@/features/customers/components/CustomerFormModal';
import { CustomerCommunicationsPanel } from '@/features/customerCommunications';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Customers</h1>
          <p className="text-sm text-text-muted">Manage your customer accounts.</p>
        </div>
        {activeTab === 'customers' && (
          <Can module={MODULES.CUSTOMERS} action={ACTIONS.CREATE}>
            <AppButton onClick={() => setFormState({ open: true, customer: null })}>
              <Plus className="size-4" />
              New customer
            </AppButton>
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

      <CustomerTable
        customers={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(customer) => setFormState({ open: true, customer })}
        onDelete={setDeleteTarget}
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
