import { useMemo, useState } from 'react';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useCreatePurchase } from '@/features/purchases/mutations/useCreatePurchase';
import { useUpdatePurchase } from '@/features/purchases/mutations/useUpdatePurchase';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable';
import { PurchaseFormModal } from '@/features/purchases/components/PurchaseFormModal';
import { PurchaseRequestsPanel, purchaseRequestApi } from '@/features/purchaseRequests';
import { GoodsReceiptNotesPanel } from '@/features/goodsReceiptNotes';
import { PURCHASE_ORDER_STATUS_PIPELINE, PURCHASE_ORDER_CANCELLED } from '@/features/purchases/validators/purchase.schema';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppInput } from '@/components/ui/AppInput';
import { AppSelect } from '@/components/ui/AppSelect';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

// Real PO status pipeline (see purchase.schema.js) — not the generic
// ORDER_STATUS enum, which doesn't match this domain's states.
const STATUS_OPTIONS = [...PURCHASE_ORDER_STATUS_PIPELINE, PURCHASE_ORDER_CANCELLED].map((value) => ({
  value,
  label: value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const TABS = [
  { key: 'purchases', label: 'Purchase Orders' },
  { key: 'requests', label: 'Purchase Requests' },
  { key: 'grn', label: 'Goods Receipt Notes' },
];

export function PurchasesPage() {
  const [activeTab, setActiveTab] = useState('purchases');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, purchase: null });

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

  const { data, isLoading, isFetching, refetch } = usePurchasesQuery(filters);
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

  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();

  const handleSubmit = (values) => {
    if (formState.purchase?.id) {
      // No generic edit endpoint exists — only a status transition
      // (see purchase.api.js transitionStatus). Everything else on the
      // form is read-only display for an existing PO.
      updatePurchase.mutateAsync({ id: formState.purchase.id, status: values.status }).then(() => setFormState({ open: false, purchase: null }));
      return;
    }
    createPurchase.mutateAsync(values).then(() => setFormState({ open: false, purchase: null }));
  };

  const handleCancelOrder = (purchase) => {
    updatePurchase.mutateAsync({ id: purchase.id, status: 'cancelled' }).then(() => setFormState({ open: false, purchase: null }));
  };

  const handleTransitionStatus = (purchase, status) => {
    updatePurchase.mutate({ id: purchase.id, status });
  };

  const handleConvertToPo = (request) => {
    setActiveTab('purchases');
    // The Purchase Requests table is fed by the list endpoint, which never
    // returns `items` (only GET /purchase-requests/:id joins them — see
    // purchaseRequest.service.js getPurchaseRequest) — fetch the full
    // detail here so the "items to convert" table isn't empty.
    purchaseRequestApi.get(request.id).then((full) => {
      setFormState({
        open: true,
        purchase: {
          poNumber: '',
          purchaseRequestId: full.id,
          vendorId: '',
          warehouseId: full.warehouseId ?? '',
          branchId: full.branchId ?? '',
          deliveryAddress: '',
          taxAmount: '',
          paymentTerms: '',
          expectedDeliveryDate: '',
          status: 'draft',
          // Purchase requests carry the real productVariantId + quantity,
          // but no cost — POs are where pricing/vendor gets decided, so
          // unitCost is left for the user to fill in per line.
          items: full.items.map((item) => ({ productVariantId: item.productVariantId, quantity: item.quantity, unitCost: '' })),
        },
      });
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h1 className="text-xl font-semibold text-text">Purchases</h1>
        <p className="text-sm text-text-muted">Purchase requests, purchase orders and goods receipt notes.</p>
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'purchases' && (
        <>
          <p className="text-sm text-text-muted">
            A purchase order can only be created from an approved purchase request — use "Convert to PO" on the
            Purchase Requests tab.
          </p>
          <FilterBar>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search purchase orders…"
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

          <PurchaseTable
            purchases={data?.data ?? []}
            productsById={productsById}
            variantsById={variantsById}
            total={data?.total ?? 0}
            page={page}
            pageSize={pageSize}
            isLoading={isLoading}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onEdit={(purchase) => setFormState({ open: true, purchase })}
            onTransitionStatus={handleTransitionStatus}
            onCancelOrder={handleCancelOrder}
          />

          <PurchaseFormModal
            open={formState.open}
            initialValues={formState.purchase}
            onClose={() => setFormState({ open: false, purchase: null })}
            onSubmit={handleSubmit}
            onCancelOrder={handleCancelOrder}
            isSubmitting={createPurchase.isPending || updatePurchase.isPending}
          />
        </>
      )}

      {activeTab === 'requests' && <PurchaseRequestsPanel onConvertToPo={handleConvertToPo} />}
      {activeTab === 'grn' && <GoodsReceiptNotesPanel />}
    </div>
  );
}
