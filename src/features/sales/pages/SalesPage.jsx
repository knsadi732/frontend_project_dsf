import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Package } from 'lucide-react';
import { useSalesOrdersQuery } from '@/features/sales/queries/useSalesOrdersQuery';
import { useCreateSalesOrder } from '@/features/sales/mutations/useCreateSalesOrder';
import { useUpdateSalesOrder } from '@/features/sales/mutations/useUpdateSalesOrder';
import { useDeleteSalesOrder } from '@/features/sales/mutations/useDeleteSalesOrder';
import { useProductsQuery } from '@/features/products/queries/useProductsQuery';
import { useInventoryListQuery } from '@/features/inventory/queries/useInventoryListQuery';
import { SalesOrderFormModal } from '@/features/sales/components/SalesOrderFormModal';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DownloadButton, EditButton, DeleteButton, CreateButton } from '@/components/ui/ActionButtons';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { AppInput } from '@/components/ui/AppInput';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { ORDER_STATUS, toStatusOptions } from '@/constants/statusEnums';
import { useDebounce } from '@/hooks/useDebounce';
import { useDateRangeFilter } from '@/hooks/useDateRangeFilter';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

const STATUS_OPTIONS = toStatusOptions(ORDER_STATUS);

function downloadSalesOrderPdf(row) {
  generateRecordPdf({
    title: `Sales Order - ${row.soNumber}`,
    fields: [
      { label: 'Customer', value: row.customer },
      { label: 'Order Date', value: row.orderDate },
      { label: 'Total', value: `Rs.${Number(row.total).toLocaleString('en-IN')}` },
      { label: 'Status', value: row.status },
    ],
    fileName: `${row.soNumber}.pdf`,
  });
}

// Ch14.14 Picking: Pick List — SKU/Qty/Warehouse/Bin per line item.
function downloadPickList(row, productsById, inventoryByProductId) {
  generateRecordPdf({
    title: `Pick List - ${row.soNumber}`,
    fields: [
      { label: 'Customer', value: row.customer },
      { label: 'Generated', value: row.pickListGeneratedAt ? new Date(row.pickListGeneratedAt).toLocaleString() : '-' },
    ],
    items: row.items,
    itemsColumns: [
      { key: 'productId', label: 'SKU', width: 40, format: (id) => productsById[id]?.sku ?? id },
      { key: 'productId', label: 'Product', width: 60, format: (id) => productsById[id]?.name ?? id },
      { key: 'quantity', label: 'Qty', width: 20 },
      { key: 'productId', label: 'Warehouse', width: 40, format: (id) => inventoryByProductId[id]?.warehouse ?? '-' },
      { key: 'productId', label: 'Bin', width: 20, format: (id) => inventoryByProductId[id]?.binLocationId ?? '-' },
    ],
    fileName: `${row.soNumber}-pick-list.pdf`,
  });
}

// Ch14.15-16 Packing / Dispatch Preparation: Packing Slip + Dispatch Note.
function downloadPackingSlip(row) {
  generateRecordPdf({
    title: `Packing Slip / Dispatch Note - ${row.soNumber}`,
    fields: [
      { label: 'Customer', value: row.customer },
      { label: 'Dispatch Note #', value: row.dispatchNoteNumber },
      { label: 'Packed At', value: row.packedAt ? new Date(row.packedAt).toLocaleString() : '-' },
      { label: 'Dispatch Date', value: row.dispatchDate },
    ],
    items: row.items,
    itemsColumns: [
      { key: 'quantity', label: 'Qty', width: 30 },
      { key: 'rate', label: 'Rate', width: 40, format: (v) => `Rs.${Number(v).toLocaleString('en-IN')}` },
    ],
    fileName: `${row.soNumber}-packing-slip.pdf`,
  });
}

export function SalesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { dateFrom, dateTo, setDateFrom, setDateTo, appliedDateFrom, appliedDateTo } = useDateRangeFilter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, salesOrder: null });
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

  const { data, isLoading, isFetching, refetch } = useSalesOrdersQuery(filters);
  const { data: productsData } = useProductsQuery({ pageSize: 200 });
  const productsById = Object.fromEntries((productsData?.data ?? []).map((p) => [p.id, p]));
  const { data: inventoryData } = useInventoryListQuery({ pageSize: 500 });
  const inventoryByProductId = Object.fromEntries((inventoryData?.data ?? []).map((row) => [row.productId, row]));
  const createSalesOrder = useCreateSalesOrder();
  const updateSalesOrder = useUpdateSalesOrder();
  const deleteSalesOrder = useDeleteSalesOrder();

  const handleSubmit = (values) => {
    const action = formState.salesOrder
      ? updateSalesOrder.mutateAsync({ id: formState.salesOrder.id, payload: values })
      : createSalesOrder.mutateAsync(values);

    action.then(() => setFormState({ open: false, salesOrder: null }));
  };

  const handleConfirmDelete = () => {
    deleteSalesOrder.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const handleMarkDelivered = (salesOrder) => {
    updateSalesOrder.mutate({ id: salesOrder.id, payload: { deliveredAt: new Date().toISOString() } });
  };

  const columns = [
    { key: 'soNumber', header: 'SO Number' },
    { key: 'customer', header: 'Customer' },
    { key: 'salesChannel', header: 'Channel', render: (row) => <span className="capitalize">{row.salesChannel ?? 'manual'}</span> },
    { key: 'orderDate', header: 'Order Date' },
    { key: 'total', header: 'Total', render: (row) => `₹${Number(row.total).toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'eta',
      header: 'Dispatch / ETA',
      render: (row) =>
        row.dispatchDate ? `Dispatch ${row.dispatchDate}` : row.productionEta ? `ETA ${row.productionEta}` : '—',
    },
    {
      key: 'linked',
      header: 'Linked',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.linkedWorkOrders?.map((wo) => (
            <BaseBadge key={wo} variant="info">
              {wo}
            </BaseBadge>
          ))}
          {row.invoiceNumber && <BaseBadge variant="success">{row.invoiceNumber}</BaseBadge>}
          {!row.linkedWorkOrders?.length && !row.invoiceNumber && <span className="text-xs text-text-muted">—</span>}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <DownloadButton label={`Download ${row.soNumber}`} onClick={(event) => { event.stopPropagation(); downloadSalesOrderPdf(row); }} />
          {row.pickListGeneratedAt && (
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                downloadPickList(row, productsById, inventoryByProductId);
              }}
              aria-label={`Download pick list for ${row.soNumber}`}
              title="Download pick list"
            >
              <ClipboardList className="size-4" />
            </AppButton>
          )}
          {row.packedAt && (
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                downloadPackingSlip(row);
              }}
              aria-label={`Download packing slip for ${row.soNumber}`}
              title="Download packing slip"
            >
              <Package className="size-4" />
            </AppButton>
          )}
          {row.dispatchNoteGeneratedAt && !row.deliveredAt && (
            <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  handleMarkDelivered(row);
                }}
                aria-label={`Mark ${row.soNumber} as delivered`}
                title="Mark as delivered"
                className="text-success hover:bg-success/10"
              >
                <CheckCircle2 className="size-4" />
              </AppButton>
            </Can>
          )}
          <Can module={MODULES.SALES} action={ACTIONS.EDIT}>
            <EditButton label={`Edit ${row.soNumber}`} onClick={(event) => { event.stopPropagation(); setFormState({ open: true, salesOrder: row }); }} />
          </Can>
          <Can module={MODULES.SALES} action={ACTIONS.DELETE}>
            <DeleteButton label={`Delete ${row.soNumber}`} onClick={(event) => { event.stopPropagation(); setDeleteTarget(row); }} />
          </Can>
        </div>
      ),
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

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete sales order"
        footer={
          <>
            <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
              Cancel
            </AppButton>
            <AppButton variant="danger" loading={deleteSalesOrder.isPending} onClick={handleConfirmDelete}>
              Delete
            </AppButton>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Are you sure you want to delete <span className="font-medium text-text">{deleteTarget?.soNumber}</span>
          ? This action cannot be undone.
        </p>
      </AppModal>
    </div>
  );
}
