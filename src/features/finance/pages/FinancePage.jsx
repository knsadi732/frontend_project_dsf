import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useCreateInvoice } from '@/features/finance/mutations/useCreateInvoice';
import { useUpdateInvoice } from '@/features/finance/mutations/useUpdateInvoice';
import { useDeleteInvoice } from '@/features/finance/mutations/useDeleteInvoice';
import { InvoiceTable } from '@/features/finance/components/InvoiceTable';
import { InvoiceFormModal } from '@/features/finance/components/InvoiceFormModal';
import { PaymentsPanel } from '@/features/payments';
import { VendorBillsPanel } from '@/features/vendorBills';
import { CreditNotesPanel } from '@/features/creditNotes';
import { LoanEsignRequestsPanel } from '@/features/loanEsignRequests';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { PAYMENT_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_OPTIONS = toStatusOptions(PAYMENT_STATUS);

const TABS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Customer Payments' },
  { key: 'vendorBills', label: 'Vendor Bills' },
  { key: 'creditNotes', label: 'Credit Notes' },
  { key: 'loanRequests', label: 'Loan Requests' },
];

export function FinancePage() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, invoice: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      status,
      dateFrom: appliedDateFrom,
      dateTo: appliedDateTo,
      page,
      pageSize,
    }),
    [debouncedSearch, status, appliedDateFrom, appliedDateTo, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useInvoicesQuery(filters);
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();

  const handleSubmit = (values) => {
    const action = formState.invoice
      ? updateInvoice.mutateAsync({ id: formState.invoice.id, payload: values })
      : createInvoice.mutateAsync(values);

    action.then(() => setFormState({ open: false, invoice: null }));
  };

  const handleConfirmDelete = () => {
    deleteInvoice.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Finance</h1>
          <p className="text-sm text-text-muted">Invoices, customer payments and vendor bills.</p>
        </div>
        {activeTab === 'invoices' && (
          <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
            <AppButton onClick={() => setFormState({ open: true, invoice: null })}>
              <Plus className="size-4" />
              New invoice
            </AppButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'invoices' && (
        <>
      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search invoices…"
          className="w-72"
        />
        <AppSelect
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          className="w-40"
          aria-label="Filter by status"
        />
        <AppInput
          type="date"
          value={dateFrom}
          onChange={(event) => {
            setDateFrom(event.target.value);
            setPage(1);
          }}
          className="w-36"
          aria-label="Due date from"
        />
        <AppInput
          type="date"
          value={dateTo}
          onChange={(event) => {
            setDateTo(event.target.value);
            setPage(1);
          }}
          className="w-36"
          aria-label="Due date to"
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

      <InvoiceTable
        invoices={data?.data ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={(invoice) => setFormState({ open: true, invoice })}
        onDelete={setDeleteTarget}
      />

      <InvoiceFormModal
        open={formState.open}
        initialValues={formState.invoice}
        onClose={() => setFormState({ open: false, invoice: null })}
        onSubmit={handleSubmit}
        isSubmitting={createInvoice.isPending || updateInvoice.isPending}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete invoice"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteInvoice.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete{' '}
          <span className="font-medium text-text">{deleteTarget?.invoiceNumber}</span>
          ? This action cannot be undone.
        </p>
      </AppModal>
        </>
      )}

      {activeTab === 'payments' && <PaymentsPanel />}
      {activeTab === 'vendorBills' && <VendorBillsPanel />}
      {activeTab === 'creditNotes' && <CreditNotesPanel />}
      {activeTab === 'loanRequests' && <LoanEsignRequestsPanel />}
    </div>
  );
}
