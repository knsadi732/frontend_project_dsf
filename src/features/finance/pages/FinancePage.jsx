import { useMemo, useState } from 'react';
import { useInvoicesQuery } from '@/features/finance/queries/useInvoicesQuery';
import { useUpdateInvoice } from '@/features/finance/mutations/useUpdateInvoice';
import { InvoiceStatusModal } from '@/features/finance/components/InvoiceStatusModal';
import { useCompanyQuery } from '@/features/company/queries/useCompanyQuery';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { salesApi } from '@/services/sales.api';
import { generateSalesOrderPdf } from '@/features/sales/utils/generateSalesOrderPdf';
import { PaymentsPanel } from '@/features/payments';
import { VendorBillsPanel } from '@/features/vendorBills';
import { CreditNotesPanel } from '@/features/creditNotes';
import { LoanEsignRequestsPanel } from '@/features/loanEsignRequests';
import { LoansPanel } from '@/features/loans';
import { ApprovalRequestsPanel } from '@/features/approvalRequests';
import { LedgerPanel } from '@/features/ledger';
import { CompliancePanel } from '@/features/compliance';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton } from '@/components/ui/ActionButtons';
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

const STATUS_OPTIONS = toStatusOptions(PAYMENT_STATUS);

// An invoice IS the linked order (finance.service.js createBillForOrder) —
// reuse the same Tax Invoice template Sales Orders download, just fetching
// the order's items (list rows don't carry line-item pricing) and passing
// the bill's own number/due date/payment status through.
async function downloadInvoicePdf(row, customersById, productsById, variantsById, company) {
  const order = await salesApi.get(row.orderId);
  const customer = customersById[order.customerId];
  generateSalesOrderPdf({
    order,
    company,
    customer,
    invoiceNumber: row.invoiceNumber,
    dueDate: row.dueDate,
    paymentStatus: row.status,
    items: (order.items ?? []).map((item) => {
      const product = productsById[variantsById[item.productVariantId]?.productId];
      return {
        label: item.productName ? `${item.sku ?? ''} — ${item.productName}`.replace(/^ — /, '') : (item.sku ?? item.productVariantId),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        lineTotal: item.lineTotal,
        hsnCode: product?.hsnCode,
      };
    }),
  });
}

const TABS = [
  { key: 'invoices', label: 'Invoices' },
  { key: 'payments', label: 'Customer Payments' },
  { key: 'vendorBills', label: 'Vendor Bills' },
  { key: 'approvals', label: 'Approval Queue' },
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
  const updateInvoice = useUpdateInvoice();

  const { data: company } = useCompanyQuery();
  const { data: customersData } = useCustomersQuery({ pageSize: 200 });
  const customersById = useMemo(
    () => Object.fromEntries((customersData?.data ?? []).map((customer) => [customer.id, customer])),
    [customersData],
  );
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = useMemo(
    () => Object.fromEntries((productsData?.data ?? []).map((product) => [product.id, product])),
    [productsData],
  );
  const { data: variantsData } = useProductVariantsQuery({ pageSize: 500 });
  const variantsById = useMemo(
    () => Object.fromEntries((variantsData?.data ?? []).map((variant) => [variant.id, variant])),
    [variantsData],
  );

  const handleSubmit = (payload) => {
    updateInvoice.mutateAsync({ id: formState.invoice.id, payload }).then(() => setFormState({ open: false, invoice: null }));
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
      render: (row) => `₹${Number(row.balanceDue ?? 0).toLocaleString('en-IN')}`,
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
          <DownloadButton label={`Download ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); downloadInvoicePdf(row, customersById, productsById, variantsById, company); }} />
          <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
            <EditButton label={`Update ${row.invoiceNumber}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, invoice: row }); }} />
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

      <InvoiceStatusModal
        open={formState.open}
        invoice={formState.invoice}
        onClose={() => setFormState({ open: false, invoice: null })}
        onSubmit={handleSubmit}
        isSubmitting={updateInvoice.isPending}
      />
        </>
      )}

      {activeTab === 'payments' && <PaymentsPanel />}
      {activeTab === 'vendorBills' && <VendorBillsPanel />}
      {activeTab === 'approvals' && <ApprovalRequestsPanel />}
      {activeTab === 'creditNotes' && <CreditNotesPanel />}
      {activeTab === 'loanRequests' && <LoanEsignRequestsPanel />}
      {activeTab === 'loans' && <LoansPanel />}
      {activeTab === 'ledger' && <LedgerPanel />}
      {activeTab === 'compliance' && <CompliancePanel />}
    </div>
  );
}
