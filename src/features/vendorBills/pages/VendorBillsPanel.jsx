import { useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useVendorBillsQuery } from '@/features/vendorBills/queries/useVendorBillsQuery';
import { useRecordVendorBillPayment } from '@/features/vendorBills/mutations/useRecordVendorBillPayment';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { VendorPaymentFormModal } from '@/features/vendorBills/components/VendorPaymentFormModal';
import { AppTable } from '@/components/ui/AppTable';
import { FilterBar } from '@/components/ui/FilterBar';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ViewButton } from '@/components/ui/ActionButtons';
import { AppButton } from '@/components/ui/AppButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const BILL_STATUS_VARIANT = { pending: 'warning', partial: 'warning', paid: 'success', overdue: 'danger' };
const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export function VendorBillsPanel() {
  const [status, setStatus] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [paymentTarget, setPaymentTarget] = useState(null);

  const filters = useMemo(() => ({ status, vendorId, page, pageSize }), [status, vendorId, page, pageSize]);

  // GET /vendor-bills (permission: vendor_bill.view) — bills are
  // auto-created from GRNs (grn.service.js), so there's no create/delete
  // flow here, only viewing and recording payments.
  const { data, isLoading, isFetching, refetch } = useVendorBillsQuery(filters);
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const vendorOptions = (vendorsData?.data ?? []).map((v) => ({ value: v.id, label: v.name }));

  const recordPayment = useRecordVendorBillPayment();

  const columns = [
    { key: 'invoiceNumber', header: 'Bill Number' },
    { key: 'vendorName', header: 'Vendor', render: (row) => row.vendorName ?? '—' },
    { key: 'poNumber', header: 'Purchase Order', render: (row) => row.poNumber ?? '—' },
    { key: 'grnNumber', header: 'GRN', render: (row) => row.grnNumber ?? '—' },
    { key: 'totalAmount', header: 'Total', render: (row) => `₹${Number(row.totalAmount).toLocaleString('en-IN')}` },
    { key: 'amountDue', header: 'Amount due', render: (row) => `₹${Number(row.amountDue).toLocaleString('en-IN')}` },
    { key: 'paymentDueDate', header: 'Due date' },
    { key: 'utrNumber', header: 'UTR', render: (row) => row.utrNumber ?? '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status ?? 'pending'} variantMap={BILL_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.invoiceUrl && <ViewButton label="View invoice" href={row.invoiceUrl} />}
          {row.status !== 'paid' && (
            <Can module={MODULES.FINANCE} action={ACTIONS.EDIT}>
              <AppButton variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPaymentTarget(row); }} aria-label="Record payment" title="Record payment">
                <CreditCard className="size-4" />
              </AppButton>
            </Can>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">Vendor bills and payments (Accounts Payable) — auto-created from GRNs.</p>

      <FilterBar>
        <MultiFilter
          filters={[
            { key: 'status', label: 'Status', options: STATUS_OPTIONS },
            { key: 'vendorId', label: 'Vendor', options: vendorOptions, placeholder: 'All vendors' },
          ]}
          values={{ status, vendorId }}
          onChange={(key, value) => {
            if (key === 'status') setStatus(value);
            if (key === 'vendorId') setVendorId(value);
            setPage(1);
          }}
          onClear={() => {
            setStatus('');
            setVendorId('');
            setPage(1);
          }}
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
        emptyMessage="No vendor bills yet"
      />

      <VendorPaymentFormModal
        open={Boolean(paymentTarget)}
        bill={paymentTarget}
        onClose={() => setPaymentTarget(null)}
        onSubmit={(values) =>
          recordPayment.mutateAsync({ id: paymentTarget.id, ...values }).then(() => setPaymentTarget(null))
        }
        isSubmitting={recordPayment.isPending}
      />
    </div>
  );
}
