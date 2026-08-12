import { useMemo, useState } from 'react';
import { Download, Pencil, Trash2 } from 'lucide-react';
import { useProductStockQuery } from '@/features/inventory/queries/useProductStockQuery';
import { useStockSummaryQuery } from '@/features/inventory/queries/useStockSummaryQuery';
import { useCreateInventoryItem } from '@/features/inventory/mutations/useCreateInventoryItem';
import { useUpdateInventoryItem } from '@/features/inventory/mutations/useUpdateInventoryItem';
import { useDeleteInventoryItem } from '@/features/inventory/mutations/useDeleteInventoryItem';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useBinsQuery } from '@/features/bins/queries/useBinsQuery';
import { InventoryFormModal } from '@/features/inventory/components/InventoryFormModal';
import { WarehouseZonesPanel } from '@/features/warehouseZones';
import { RacksPanel } from '@/features/racks';
import { ShelvesPanel } from '@/features/shelves';
import { BinsPanel } from '@/features/bins';
import { InventoryMovementsPanel } from '@/features/inventoryMovements';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function downloadInventoryPdf(row, sku, productName, warehouseName) {
  generateRecordPdf({
    title: `Inventory - ${productName}`,
    fields: [
      { label: 'SKU', value: sku },
      { label: 'Warehouse', value: warehouseName },
      { label: 'Quantity on hand', value: row.quantityOnHand },
      { label: 'Reserved', value: row.quantityReserved },
      { label: 'Available', value: row.quantityOnHand - row.quantityReserved },
      { label: 'Status', value: row.status },
    ],
    fileName: `${sku ?? row.id}-inventory.pdf`,
  });
}

const TABS = [
  { key: 'inventory', label: 'Inventory' },
  { key: 'zones', label: 'Zones' },
  { key: 'racks', label: 'Racks' },
  { key: 'shelves', label: 'Shelves' },
  { key: 'bins', label: 'Bins' },
  { key: 'movements', label: 'Movements' },
];

// 'salable' vs non-salable 'office_consumable'/'raw_material' — derived
// server-side from products.is_sellable/product_type (see
// stock.repository.js's INVENTORY_CATEGORY_CASE). Separates stock that's
// actually sold to customers from what's sitting around to make/run the
// business with.
const INVENTORY_CATEGORY_OPTIONS = [
  { value: 'salable', label: 'Salable' },
  { value: 'office_consumable', label: 'Office Consumable' },
  { value: 'raw_material', label: 'Raw Material' },
];

const INVENTORY_CATEGORY_LABEL = {
  salable: 'Salable',
  office_consumable: 'Office Consumable',
  raw_material: 'Raw Material',
};

const INVENTORY_CATEGORY_VARIANT = {
  salable: 'success',
  office_consumable: 'info',
  raw_material: 'warning',
};

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [warehouseId, setWarehouseId] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filters = useMemo(
    () => ({ warehouseId, inventoryCategory, page, pageSize }),
    [warehouseId, inventoryCategory, page, pageSize],
  );

  // GET /products/stock (permission: product.manage) — paginated
  // warehouse_stock rows, filterable by warehouseId; only carries
  // warehouseId/productVariantId/quantities/status, so SKU/product/
  // warehouse names are joined in below.
  const { data, isLoading, isFetching, refetch } = useProductStockQuery(filters);

  // GET /products/stock/summary — totals per Salable/Office
  // Consumable/Raw Material bucket, independent of the category filter
  // above (so the tiles always show all three even when the table is
  // filtered down to one) but respecting the warehouse filter.
  const { data: summaryData } = useStockSummaryQuery({ warehouseId });
  const summaryByCategory = useMemo(
    () => Object.fromEntries((summaryData ?? []).map((row) => [row.inventory_category, row])),
    [summaryData],
  );

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const warehouses = warehousesData?.data ?? [];
  const warehouseOptions = warehouses.map((warehouse) => ({ value: warehouse.id, label: warehouse.name }));

  const { data: binsData } = useBinsQuery({ pageSize: 100 });
  const bins = binsData?.data ?? [];
  const binOptions = bins.map((bin) => ({ value: bin.id, label: bin.code }));

  const createInventoryItem = useCreateInventoryItem();
  const updateInventoryItem = useUpdateInventoryItem();
  const deleteInventoryItem = useDeleteInventoryItem();

  const handleSubmit = (values) => {
    const action = formState.item
      ? updateInventoryItem.mutateAsync({ id: formState.item.id, payload: values })
      : createInventoryItem.mutateAsync(values);

    action.then(() => setFormState({ open: false, item: null }));
  };

  const handleConfirmDelete = () => {
    deleteInventoryItem.mutate(deleteTarget.id, { onSettled: () => setDeleteTarget(null) });
  };

  const columns = [
    { key: 'sku', header: 'SKU', render: (row) => row.sku ?? '—' },
    { key: 'productName', header: 'Product Name', render: (row) => row.productName ?? '—' },
    {
      key: 'variant',
      header: 'Variant',
      render: (row) => [row.variantSize, row.variantColor].filter(Boolean).join(' / ') || '—',
    },
    { key: 'categoryName', header: 'Category', render: (row) => row.categoryName ?? '—' },
    {
      key: 'inventoryCategory',
      header: 'Type',
      render: (row) => (
        <BaseBadge variant={INVENTORY_CATEGORY_VARIANT[row.inventoryCategory] ?? 'default'}>
          {INVENTORY_CATEGORY_LABEL[row.inventoryCategory] ?? row.inventoryCategory ?? '—'}
        </BaseBadge>
      ),
    },
    { key: 'warehouse', header: 'Warehouse', render: (row) => row.warehouseName ?? '—' },
    { key: 'quantityOnHand', header: 'On Hand' },
    { key: 'quantityReserved', header: 'Reserved' },
    { key: 'available', header: 'Available', render: (row) => row.quantityOnHand - row.quantityReserved },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <BaseBadge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</BaseBadge>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        return (
          <div className="flex justify-end gap-1">
            <AppButton
              variant="ghost"
              size="sm"
              onClick={(event) => {
                event.stopPropagation();
                downloadInventoryPdf(row, row.sku, row.productName, row.warehouseName);
              }}
              aria-label={`Download ${row.productName ?? row.sku ?? 'inventory row'}`}
            >
              <Download className="size-4" />
            </AppButton>
            <Can module={MODULES.INVENTORY} action={ACTIONS.EDIT}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  setFormState({ open: true, item: row });
                }}
                aria-label={`Edit ${row.productName ?? row.sku ?? 'inventory row'}`}
              >
                <Pencil className="size-4" />
              </AppButton>
            </Can>
            <Can module={MODULES.INVENTORY} action={ACTIONS.DELETE}>
              <AppButton
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteTarget(row);
                }}
                aria-label={`Delete ${row.productName ?? row.sku ?? 'inventory row'}`}
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 className="size-4" />
              </AppButton>
            </Can>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text">Inventory</h1>
          <p className="text-sm text-text-muted">Manage your stock ledger and warehouse locations.</p>
        </div>
        {activeTab === 'inventory' && (
          <Can module={MODULES.INVENTORY} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormState({ open: true, item: null })}>New inventory item</CreateButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'inventory' && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {INVENTORY_CATEGORY_OPTIONS.map((option) => {
              const summary = summaryByCategory[option.value];
              const isActive = inventoryCategory === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setInventoryCategory(isActive ? '' : option.value);
                    setPage(1);
                  }}
                  className={`flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors ${
                    isActive ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:bg-primary/5'
                  }`}
                >
                  <span className="text-xs font-medium text-text-muted">{option.label}</span>
                  <span className="text-lg font-semibold text-text">
                    {Number(summary?.total_on_hand ?? 0).toLocaleString('en-IN')} units
                  </span>
                  <span className="text-xs text-text-muted">
                    {summary?.sku_count ?? 0} SKU{Number(summary?.sku_count ?? 0) === 1 ? '' : 's'}
                    {Number(summary?.total_reserved ?? 0) > 0 && ` · ${Number(summary.total_reserved).toLocaleString('en-IN')} reserved`}
                  </span>
                </button>
              );
            })}
          </div>

          <FilterBar>
            <MultiFilter
              filters={[
                { key: 'warehouseId', label: 'Warehouse', options: warehouseOptions, placeholder: 'All warehouses' },
                { key: 'inventoryCategory', label: 'Type', options: INVENTORY_CATEGORY_OPTIONS, placeholder: 'All types' },
              ]}
              values={{ warehouseId, inventoryCategory }}
              onChange={(key, value) => {
                if (key === 'warehouseId') setWarehouseId(value);
                if (key === 'inventoryCategory') setInventoryCategory(value);
                setPage(1);
              }}
              onClear={() => {
                setWarehouseId('');
                setInventoryCategory('');
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
            onRowClick={(item) => setFormState({ open: true, item })}
            emptyMessage="No inventory items yet"
          />

          <InventoryFormModal
            open={formState.open}
            initialValues={formState.item}
            binOptions={binOptions}
            onClose={() => setFormState({ open: false, item: null })}
            onSubmit={handleSubmit}
            isSubmitting={createInventoryItem.isPending || updateInventoryItem.isPending}
          />

          <AppModal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            title="Delete inventory item"
            footer={
              <>
                <AppButton variant="secondary" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </AppButton>
                <AppButton variant="danger" loading={deleteInventoryItem.isPending} onClick={handleConfirmDelete}>
                  Delete
                </AppButton>
              </>
            }
          >
            <p className="text-sm text-text-muted">
              Are you sure you want to delete{' '}
              <span className="font-medium text-text">{deleteTarget?.productName ?? deleteTarget?.sku}</span>? This
              action cannot be undone.
            </p>
          </AppModal>
        </>
      )}

      {activeTab === 'zones' && <WarehouseZonesPanel />}
      {activeTab === 'racks' && <RacksPanel />}
      {activeTab === 'shelves' && <ShelvesPanel />}
      {activeTab === 'bins' && <BinsPanel />}
      {activeTab === 'movements' && <InventoryMovementsPanel />}
    </div>
  );
}
