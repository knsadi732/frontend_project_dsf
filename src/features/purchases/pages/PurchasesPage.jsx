import { useMemo, useState } from 'react';
import { Check, PackageCheck, PackageOpen, Send, SendHorizonal } from 'lucide-react';
import { usePersistedTab } from '@/hooks/usePersistedTab';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useCreatePurchase } from '@/features/purchases/mutations/useCreatePurchase';
import { useUpdatePurchase } from '@/features/purchases/mutations/useUpdatePurchase';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useProductVariantsQuery } from '@/features/productVariants/queries/useProductVariantsQuery';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useCompanyQuery } from '@/features/company/queries/useCompanyQuery';
import { PurchaseFormModal } from '@/features/purchases/components/PurchaseFormModal';
import { PurchaseRequestsPanel } from '@/features/purchaseRequests';
import { usePurchaseRequestsQuery } from '@/features/purchaseRequests/queries/usePurchaseRequestsQuery';
import { RfqsPanel } from '@/features/rfqs';
import { GoodsReceiptNotesPanel } from '@/features/goodsReceiptNotes';
import { purchaseApi } from '@/features/purchases/api';
import { generatePurchaseOrderPdf } from '@/features/purchases/utils/generatePurchaseOrderPdf';
import { PURCHASE_ORDER_STATUS_PIPELINE, PURCHASE_ORDER_CANCELLED } from '@/features/purchases/validators/purchase.schema';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { AppTable } from '@/components/ui/AppTable';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, CancelButton } from '@/components/ui/ActionButtons';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
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

function variantLabel(variantId, variantsById, productsById) {
  const variant = variantsById?.[variantId];
  if (!variant) return variantId;
  return `${variant.sku} — ${productsById?.[variant.productId]?.name ?? 'Unknown product'}`;
}

function downloadPurchasePdf(row, productsById, variantsById, company, vendorsById, warehousesById) {
  // The list endpoint (which feeds this table) never returns `items` — only
  // GET /purchase-orders/:id joins them (same gap fixed for Convert-to-PO)
  // — fetch the full record so the PDF's item table isn't empty.
  purchaseApi.get(row.id).then((full) => {
    generatePurchaseOrderPdf({
      po: full,
      company,
      vendor: vendorsById[full.vendorId],
      warehouse: warehousesById[full.warehouseId],
      items: (full.items ?? []).map((item) => {
        if (item.itemId) {
          return {
            label: `${item.itemCode ?? item.itemId} — ${item.itemName ?? 'Item'}`,
            quantity: item.quantity,
            unitCost: item.unitCost,
            hsnCode: undefined,
            uom: item.itemUom,
          };
        }
        const variant = variantsById[item.productVariantId];
        const product = productsById[variant?.productId];
        return {
          label: variantLabel(item.productVariantId, variantsById, productsById),
          quantity: item.quantity,
          unitCost: item.unitCost,
          hsnCode: product?.hsnCode,
          uom: product?.uom,
        };
      }),
    });
  });
}

const EDIT_LOCKED_STATUSES = ['completed', 'cancelled'];

// This domain's status words ("approved", "sent", etc.) mean something
// different here than in other modules, so it needs its own map rather
// than the shared default in constants/statusEnums.js.
const PO_STATUS_VARIANT = {
  draft: 'default',
  pending_approval: 'warning',
  approved: 'success',
  sent: 'info',
  acknowledged: 'info',
  partially_received: 'info',
  completed: 'success',
  cancelled: 'danger',
};

// Real pipeline (purchase.schema.js / backend PURCHASE_ORDER_STATUS_PIPELINE):
// draft -> pending_approval -> approved -> sent -> acknowledged ->
// partially_received -> completed, one step at a time. Each entry here is
// the single next-step button shown for that status.
const NEXT_STEP = {
  draft: { status: 'pending_approval', label: 'Send for approval', icon: Send, variant: 'primary' },
  pending_approval: { status: 'approved', label: 'Approve PO', icon: Check, variant: 'success' },
  approved: { status: 'sent', label: 'Send to vendor', icon: SendHorizonal, variant: 'info' },
  sent: { status: 'acknowledged', label: 'Mark acknowledged', icon: PackageOpen, variant: 'info' },
  acknowledged: { status: 'partially_received', label: 'Mark partially received', icon: PackageCheck, variant: 'info' },
  partially_received: { status: 'completed', label: 'Mark completed', icon: PackageCheck, variant: 'success' },
};

const TABS = [
  { key: 'requests', label: 'Purchase Requests' },
  { key: 'rfqs', label: 'RFQ & Quotations' },
  { key: 'purchases', label: 'Purchase Orders' },
  { key: 'grn', label: 'Goods Receipt Notes' },
];

export function PurchasesPage() {
  const [activeTab, setActiveTab] = usePersistedTab('purchases', 'purchases');
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
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const vendorsById = useMemo(
    () => Object.fromEntries((vendorsData?.data ?? []).map((vendor) => [vendor.id, vendor])),
    [vendorsData],
  );
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehousesById = useMemo(
    () => Object.fromEntries((warehousesData?.data ?? []).map((warehouse) => [warehouse.id, warehouse])),
    [warehousesData],
  );
  const { data: company } = useCompanyQuery();
  const { data: purchaseRequestsData } = usePurchaseRequestsQuery({ pageSize: 500 });
  const purchaseRequestsById = useMemo(
    () => Object.fromEntries((purchaseRequestsData?.data ?? []).map((pr) => [pr.id, pr])),
    [purchaseRequestsData],
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

  const columns = [
    { key: 'poNumber', header: 'PO Number' },
    { key: 'prNumber', header: 'PR Number', render: (row) => purchaseRequestsById[row.purchaseRequestId]?.prNumber ?? '—' },
    { key: 'orderDate', header: 'Order Date' },
    { key: 'total', header: 'Total', render: (row) => `₹${Number(row.total).toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={PO_STATUS_VARIANT} /> },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        const next = NEXT_STEP[row.status];
        const isCancellable = !EDIT_LOCKED_STATUSES.includes(row.status);
        return (
          <div className="flex justify-end gap-1">
            <DownloadButton
              label={`Download ${row.poNumber}`}
              onClick={(event) => {
                event.stopPropagation();
                downloadPurchasePdf(row, productsById, variantsById, company, vendorsById, warehousesById);
              }}
            />
            {!EDIT_LOCKED_STATUSES.includes(row.status) && (
              <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
                <EditButton label={`Edit ${row.poNumber}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, purchase: row }); }} />
              </Can>
            )}
            {next && (
              <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
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
            {isCancellable && (
              <Can module={MODULES.PURCHASES} action={ACTIONS.EDIT}>
                <CancelButton label="Cancel order" onClick={(event) => { event.stopPropagation(); handleCancelOrder(row); }} />
              </Can>
            )}
          </div>
        );
      },
    },
  ];

  // Fired from RfqsPanel once a vendor has been selected on an RFQ (plan.md
  // 11.20: "Purchase Orders can only be created for the selected vendor") —
  // pre-fills the same PurchaseFormModal used for direct/manual PO creation,
  // but with vendor + per-line unit cost taken from that quotation instead
  // of left blank. `rfq` here is the full detail object (materialItems +
  // quotations already loaded by RfqDetailModal's useRfqQuery).
  const handleCreatePoFromQuotation = (rfq, quotation) => {
    setActiveTab('purchases');
    const items = rfq.materialItems.map((material) => {
      // A material line is either a Product Variant or an Item Master row —
      // match the quotation's corresponding line by whichever it is.
      const quoted = material.itemId
        ? quotation.items.find((item) => item.itemId === material.itemId)
        : quotation.items.find((item) => item.productVariantId === material.productVariantId);
      return {
        ...(material.itemId
          ? { itemId: material.itemId, itemCode: material.itemCode, itemName: material.itemName }
          : { productVariantId: material.productVariantId }),
        quantity: material.quantity,
        unitCost: quoted?.unitPrice ?? '',
      };
    });
    setFormState({
      open: true,
      purchase: {
        poNumber: '',
        purchaseRequestId: rfq.purchaseRequestId,
        rfqId: rfq.id,
        vendorId: quotation.vendorId,
        warehouseId: rfq.warehouseId ?? '',
        branchId: rfq.branchId ?? '',
        deliveryAddress: '',
        taxAmount: '',
        paymentTerms: quotation.paymentTerms || '',
        expectedDeliveryDate: '',
        status: 'draft',
        items,
      },
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
            A purchase order is created once a vendor has been selected on an RFQ — see the "RFQ &amp; Quotations" tab.
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
            onRowClick={(purchase) => setFormState({ open: true, purchase })}
            emptyMessage="No purchase orders yet"
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

      {activeTab === 'requests' && <PurchaseRequestsPanel />}
      {activeTab === 'rfqs' && <RfqsPanel onCreatePo={handleCreatePoFromQuotation} />}
      {activeTab === 'grn' && <GoodsReceiptNotesPanel />}
    </div>
  );
}
