import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useCustomerCommunicationsQuery } from '@/features/customerCommunications/queries/useCustomerCommunicationsQuery';
import { useCreateCustomerCommunication } from '@/features/customerCommunications/mutations/useCreateCustomerCommunication';
import { CustomerCommunicationTable } from '@/features/customerCommunications/components/CustomerCommunicationTable';
import { CustomerCommunicationFormModal } from '@/features/customerCommunications/components/CustomerCommunicationFormModal';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function CustomerCommunicationsPanel() {
  const { user } = useAuth();
  const [customerId, setCustomerId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);

  const { data: customersData } = useCustomersQuery({ pageSize: 200 });
  const customers = customersData?.data ?? [];
  const customerOptions = customers.map((customer) => ({ value: customer.id, label: customer.name }));

  const { data, isLoading } = useCustomerCommunicationsQuery({ page, pageSize });
  const communications = useMemo(
    () => (data?.data ?? []).filter((item) => !customerId || item.customerId === customerId),
    [data, customerId],
  );

  const createCommunication = useCreateCustomerCommunication();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <AppSelect
          value={customerId}
          onChange={(event) => setCustomerId(event.target.value)}
          options={customerOptions}
          placeholder="All customers"
          className="w-64"
          aria-label="Filter by customer"
        />
        <Can module={MODULES.CUSTOMERS} action={ACTIONS.CREATE}>
          <AppButton onClick={() => setFormOpen(true)} disabled={!customerId}>
            <Plus className="size-4" />
            Log communication
          </AppButton>
        </Can>
      </div>

      <CustomerCommunicationTable
        communications={communications}
        total={communications.length}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />

      <CustomerCommunicationFormModal
        open={formOpen}
        customerId={customerId}
        contactedBy={user?.name}
        onClose={() => setFormOpen(false)}
        onSubmit={(values) => createCommunication.mutateAsync(values).then(() => setFormOpen(false))}
        isSubmitting={createCommunication.isPending}
      />
    </div>
  );
}
