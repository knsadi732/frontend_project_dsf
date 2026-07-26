import { useMemo, useState } from 'react';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useCreateInvoice } from '@/features/finance/mutations/useCreateInvoice';
import { useUpdateInvoice } from '@/features/finance/mutations/useUpdateInvoice';
import { useDeleteInvoice } from '@/features/finance/mutations/useDeleteInvoice';
import { InvoiceFormModal } from '@/features/finance/components/InvoiceFormModal';
import { PaymentsPanel } from '@/features/payments';
import { VendorBillsPanel } from '@/features/vendorBills';
import { CreditNotesPanel } from '@/features/creditNotes';
import { LoanEsignRequestsPanel } from '@/features/loanEsignRequests';
import { LoansPanel } from '@/features/loans';
import { LedgerPanel } from '@/features/ledger';
import { CompliancePanel } from '@/features/compliance';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton, DownloadButton, EditButton, DeleteButton } from '@/components/ui/ActionButtons';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { PAYMENT_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

const STATUS_OPTIONS = toStatusOptions(PAYMENT_STATUS);

function downloadInvoicePdf(row) {
  generateRecordPdf({
    title: `Invoice - ${row.invoiceNumber}`,
    fields: [
      { label: 'Party', value: row.party },
      { label: 'Linked SO', value: row.salesOrderNumber ?? '-' },
      { label: 'Amount', value: `Rs.${Number(row.amount).toLocaleString('en-IN')}` },
      { label: 'GST', value: row.gstAmount ? `${row.gstRate}% (Rs.${Number(row.gstAmount).toLocaleString('en-IN')})` : '-' },
      { label: 'Due Date', value: row.dueDate },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.invoiceNumber}.pdf`,
  });
}

const TABS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Customer Payments' },
  { key: 'vendorBills', label: 'Vendor Bills' },
  { key: 'creditNotes', label: 'Credit Notes' },
  { key: 'loanRequests', label: 'Loan Requests' },
  { key: 'loans', label: 'Loans (Debt)' },
  { key: 'ledger', label: 'Ledger' },
  { key: 'compliance', label: 'Compliance' },
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

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'party', header: 'Party' },
    { key: 'amount', header: 'Amount', render: (row) => `₹${Number(row.amount).toLocaleString('en-IN')}` },
    {
      key: 'gst',
      header: 'GST',
      render: (row) => (row.gstAmount ? `${row.gstRate}% (₹${Number(row.gstAmount).toLocaleString('en-IN')})` : '—'),
    },
    {
      key: 'balanceDue',
      header: 'Balance Due',
      render: (row) => (row.status === 'partial' && row.balanceDue != null ? `₹${Number(row.balanceDue).toLocaleString('en-IN')}` : '—'),
    },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'linkedSo',
      header: 'Linked SO',
      render: (row) =>
        row.salesOrderNumber ? (
          <BaseBadge variant="info">{row.salesOrderNumber}</BaseBadge>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton label={`Download ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); downloadInvoicePdf(row); }} />
          <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, invoice: row }); }} />
          </Can>
          <Can module={MODULES.FINANCE} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Finance</h1>
          <p className="text-sm text-text-muted">Invoices, customer payments and vendor bills.</p>
        </div>
        {activeTab === 'invoices' && (
          <Can module={MODULES.FINANCE} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, invoice: null })}>New invoice</CreateButton>
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
        <MultiFilter
          filters={[{ key: 'status', label: 'Status', options: STATUS_OPTIONS }]}
          values={{ status }}
          onChange={(key, value) => {
            setStatus(value);
            setPage(1);
          }}
          onClear={() => {
            setStatus('');
            setPage(1);
          }}
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
        onRowClick={(invoice) => setFormState({ open: true, invoice })}
        emptyMessage="No invoices yet"
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
      {activeTab === 'loans' && <LoansPanel />}
      {activeTab === 'ledger' && <LedgerPanel />}
      {activeTab === 'compliance' && <CompliancePanel />}
    </div>
  );
}
