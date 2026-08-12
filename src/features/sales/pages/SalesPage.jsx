import { useMemo, useState } from 'react';
import { Check, PackageCheck, PackageOpen, Send } from 'lucide-react';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useCreateSalesOrder } from '@/features/sales/mutations/useCreateSalesOrder';
import { useUpdateSalesOrder } from '@/features/sales/mutations/useUpdateSalesOrder';
import { useCustomersQuery } from '@/features/customers/queries/useCustomersQuery';
import { useCompanyQuery } from '@/features/company/queries/useCompanyQuery';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { SalesOrderFormModal } from '@/features/sales/components/SalesOrderFormModal';
import { ORDER_STATUS_PIPELINE } from '@/features/sales/validators/salesOrder.schema';
import { salesApi } from '@/services/sales.api';
import { generateSalesOrderPdf } from '@/features/sales/utils/generateSalesOrderPdf';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, CreateButton } from '@/components/ui/ActionButtons';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_OPTIONS = ORDER_STATUS_PIPELINE.map((value) => ({ value, label: value.replace(/\b\w/g, (c) => c.toUpperCase()) }));

const ORDER_STATUS_VARIANT = {
  pending: 'warning',
  confirmed: 'info',
  packed: 'info',
  dispatched: 'info',
  delivered: 'success',
  completed: 'success',
};

// Real pipeline (order.service.js ORDER_STATUS_PIPELINE): pending ->
// confirmed -> packed -> dispatched -> delivered -> completed, one step at a
// time. Each entry here is the single next-step button shown for that status.
const NEXT_STEP = {
  pending: { status: 'confirmed', label: 'Confirm order', icon: Check, variant: 'success' },
  confirmed: { status: 'packed', label: 'Mark packed', icon: PackageOpen, variant: 'info' },
  packed: { status: 'dispatched', label: 'Mark dispatched', icon: Send, variant: 'info' },
  dispatched: { status: 'delivered', label: 'Mark delivered', icon: PackageCheck, variant: 'success' },
};

// List rows don't carry priced items (order.repository.js `list` only
// attaches a lightweight sku/name summary) — fetch the full order detail,
// whose items are already joined to sku/product_name (order.repository.js
// findItems) so the invoice never has to fall back to a raw variant ID.
async function downloadSalesOrderPdf(row, customersById, productsById, variantsById, company) {
  const order = await salesApi.get(row.id);
  const customer = customersById[row.customerId];
  generateSalesOrderPdf({
    order,
    company,
    customer,
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

export function SalesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, salesOrder: null });

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

  const { data, isLoading, isFetching, refetch } = useSalesOrdersQuery(filters);
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
  const { data: company } = useCompanyQuery();
  const createSalesOrder = useCreateSalesOrder();
  const updateSalesOrder = useUpdateSalesOrder();

  const handleSubmit = (values) => {
    if (formState.salesOrder?.id) {
      // No generic edit endpoint exists — only a status transition (see
      // sales.api.js transitionStatus). Everything else on the form is
      // read-only display for an existing order. The status field defaults
      // to the current status (so it round-trips unchanged if left alone),
      // but the backend's transition endpoint rejects a same-status target
      // (e.g. "pending" isn't a valid transition target) — so only call it
      // when the value actually changed.
      if (values.status === formState.salesOrder.status) {
        setFormState({ open: false, salesOrder: null });
        return;
      }
      updateSalesOrder.mutateAsync({ id: formState.salesOrder.id, status: values.status }).then(() => setFormState({ open: false, salesOrder: null }));
      return;
    }
    createSalesOrder.mutateAsync(values).then(() => setFormState({ open: false, salesOrder: null }));
  };

  const handleTransitionStatus = (salesOrder, nextStatus) => {
    updateSalesOrder.mutate({ id: salesOrder.id, status: nextStatus });
  };

  const columns = [
    { key: 'orderNumber', header: 'SO Number' },
    { key: 'customer', header: 'Customer', render: (row) => customersById[row.customerId]?.name ?? row.customerId },
    {
      key: 'items',
      header: 'Product(s)',
      render: (row) =>
        row.items?.length ? (
          <div className="flex flex-col gap-0.5">
            {row.items.map((item, index) => (
              <span key={index} className="text-xs">
                {item.productName ?? item.sku ?? '—'} × {item.quantity}
              </span>
            ))}
          </div>
        ) : (
          '—'
        ),
    },
    { key: 'orderDate', header: 'Order Date' },
    { key: 'total', header: 'Total', render: (row) => `₹${Number(row.total ?? 0).toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={ORDER_STATUS_VARIANT} /> },
    { key: 'paymentStatus', header: 'Payment', render: (row) => <StatusBadge status={row.paymentStatus} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        const next = NEXT_STEP[row.status];
        return (
          <div className="flex justify-end gap-1">
            <DownloadButton label={`Download ${row.orderNumber}`} onClick={(event) => { event.stopPropagation(); downloadSalesOrderPdf(row, customersById, productsById, variantsById, company); }} />
            <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
              <EditButton label={`Edit ${row.orderNumber}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, salesOrder: row }); }} />
            </Can>
            {next && (
              <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
                <AppButton
                  variant={next.variant}
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleTransitionStatus(row, next.status);
                  }}
                  aria-label={next.label}
                  title={next.label}
                >
                  <next.icon className="size-4" />
                </AppButton>
              </Can>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Sales Orders</h1>
          <p className="text-sm text-text-muted">Manage your sales orders.</p>
        </div>
        <Can module={MODULES.SALES} action={ACTIONS.CREATE}>
          <CreateButton onClick={() => setFormState({ open: true, salesOrder: null })}>New sales order</CreateButton>
        </Can>
      </div>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search sales orders…"
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
          aria-label="Order date from"
        />
        <AppInput
          type="date"
          value={dateTo}
          onChange={(event) => {
            setDateTo(event.target.value);
            setPage(1);
          }}
          className="w-36"
          aria-label="Order date to"
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
        onRowClick={(salesOrder) => setFormState({ open: true, salesOrder })}
        emptyMessage="No sales orders yet"
      />

      <SalesOrderFormModal
        open={formState.open}
        initialValues={formState.salesOrder}
        onClose={() => setFormState({ open: false, salesOrder: null })}
        onSubmit={handleSubmit}
        isSubmitting={createSalesOrder.isPending || updateSalesOrder.isPending}
      />
    </div>
  );
}
