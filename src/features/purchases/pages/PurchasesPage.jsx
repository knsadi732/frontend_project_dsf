import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useCreatePurchase } from '@/features/purchases/mutations/useCreatePurchase';
import { useUpdatePurchase } from '@/features/purchases/mutations/useUpdatePurchase';
import { useDeletePurchase } from '@/features/purchases/mutations/useDeletePurchase';
import { useUpdatePurchaseRequest } from '@/features/purchaseRequests/mutations/useUpdatePurchaseRequest';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable';
import { PurchaseFormModal } from '@/features/purchases/components/PurchaseFormModal';
import { PurchaseRequestsPanel } from '@/features/purchaseRequests';
import { GoodsReceiptNotesPanel } from '@/features/goodsReceiptNotes';
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
import { ORDER_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_OPTIONS = toStatusOptions(ORDER_STATUS);

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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [convertingRequestId, setConvertingRequestId] = useState(null);

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
  const createPurchase = useCreatePurchase();
  const updatePurchase = useUpdatePurchase();
  const deletePurchase = useDeletePurchase();
  const updatePurchaseRequest = useUpdatePurchaseRequest();

  const handleSubmit = (values) => {
    // Only forward `status` when it actually changed — the backend rejects
    // a "transition" to the PO's current status (assertTransition only
    // allows moving to the very next pipeline step), so re-submitting the
    // form without picking "Advance to …" would otherwise 400 for nothing.
    const statusChanged = values.status !== formState.purchase?.status;
    const payload = statusChanged ? values : { ...values, status: undefined };

    const action = formState.purchase?.id
      ? updatePurchase.mutateAsync({ id: formState.purchase.id, payload })
      : createPurchase.mutateAsync(payload);

    action.then((result) => {
      // Chapter-11.md §11.4: an approved PR moves to "Converted to RFQ"
      // once it's actioned — RFQ itself isn't its own feature yet, so this
      // fires the moment the PO that supersedes it is created/saved.
      if (convertingRequestId) {
        updatePurchaseRequest.mutate({
          id: convertingRequestId,
          payload: { status: 'converted_to_rfq', linkedPurchaseOrderId: result.id },
        });
        setConvertingRequestId(null);
      }
      setFormState({ open: false, purchase: null });
    });
  };

  const handleConfirmDelete = () => {
    deletePurchase.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const handleConvertToPo = (request) => {
    setConvertingRequestId(request.id);
    setActiveTab('purchases');
    setFormState({
      open: true,
      purchase: {
        poNumber: '',
        vendorId: '',
        supplier: '',
        warehouseId: request.warehouseId ?? '',
        orderDate: new Date().toISOString().slice(0, 10),
        status: ORDER_STATUS.DRAFT,
        // Purchase requests carry a real productId but no price — POs are
        // where pricing/vendor gets decided, so rate is left for the user.
        items: request.items.map((item) => ({ productId: item.productId, quantity: item.quantity, rate: '' })),
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Purchases</h1>
          <p className="text-sm text-text-muted">Purchase requests, purchase orders and goods receipt notes.</p>
        </div>
        {activeTab === 'purchases' && (
          <Can module={MODULES.PURCHASES} action={ACTIONS.CREATE}>
            <AppButton onClick={() => setFormState({ open: true, purchase: null })}>
              <Plus className="size-4" />
              New purchase order
            </AppButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'purchases' && (
        <>
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
            onDelete={setDeleteTarget}
          />

          <PurchaseFormModal
            open={formState.open}
            initialValues={formState.purchase}
            onClose={() => {
              setFormState({ open: false, purchase: null });
              setConvertingRequestId(null);
            }}
            onSubmit={handleSubmit}
            isSubmitting={createPurchase.isPending || updatePurchase.isPending}
          />

          <AppModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            title="Delete purchase order"
            footer={
              <>
                <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </AppButton>
                <AppButton variant="danger" loading={deletePurchase.isPending} onClick={handleConfirmDelete}>
                  Delete
                </AppButton>
              </>
            }
          >
            <p className="text-sm text-text-muted">
              Are you sure you want to delete{' '}
              <span className="font-medium text-text">{deleteTarget?.poNumber}</span>? This action cannot be undone.
            </p>
          </AppModal>
        </>
      )}

      {activeTab === 'requests' && <PurchaseRequestsPanel onConvertToPo={handleConvertToPo} />}
      {activeTab === 'grn' && <GoodsReceiptNotesPanel />}
    </div>
  );
}
