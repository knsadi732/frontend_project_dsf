import { useMemo, useState } from 'react';
import { Download, Pencil, Trash2, Plus } from 'lucide-react';
import { useInventoryListQuery } from '@/features/inventory/queries/useInventoryListQuery';
import { useCreateInventoryItem } from '@/features/inventory/mutations/useCreateInventoryItem';
import { useUpdateInventoryItem } from '@/features/inventory/mutations/useUpdateInventoryItem';
import { useDeleteInventoryItem } from '@/features/inventory/mutations/useDeleteInventoryItem';
import { useBinsQuery } from '@/features/bins/queries/useBinsQuery';
import { InventoryFormModal } from '@/features/inventory/components/InventoryFormModal';
import { WarehouseZonesPanel } from '@/features/warehouseZones';
import { RacksPanel } from '@/features/racks';
import { ShelvesPanel } from '@/features/shelves';
import { BinsPanel } from '@/features/bins';
import { InventoryMovementsPanel } from '@/features/inventoryMovements';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { AppTable } from '@/components/ui/AppTable';
import { BaseBadge } from '@/components/ui/BaseBadge';
import { AppButton } from '@/components/ui/AppButton';
import { AppModal } from '@/components/ui/AppModal';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { Tabs } from '@/layouts/components/Tabs';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { generateRecordPdf } from '@/utils/generateRecordPdf';

function totalQuantity(row) {
  return (
    Number(row.quantity || 0) +
    Number(row.reservedQuantity || 0) +
    Number(row.damagedQuantity || 0) +
    Number(row.inTransitQuantity || 0) +
    Number(row.repairQuantity || 0)
  );
}

function downloadInventoryPdf(row) {
  generateRecordPdf({
    title: `Inventory - ${row.productName}`,
    fields: [
      { label: 'SKU', value: row.sku },
      { label: 'Warehouse', value: row.warehouse },
      { label: 'Available Quantity', value: row.quantity },
      { label: 'Reserved', value: row.reservedQuantity ?? 0 },
      { label: 'Damaged', value: row.damagedQuantity ?? 0 },
      { label: 'In Transit', value: row.inTransitQuantity ?? 0 },
      { label: 'In Repair', value: row.repairQuantity ?? 0 },
      { label: 'Total Quantity', value: totalQuantity(row) },
      { label: 'Reorder Level', value: row.reorderLevel },
      { label: 'Stock Status', value: row.quantity <= row.reorderLevel ? 'Low stock' : 'In stock' },
    ],
    fileName: `${row.sku}-inventory.pdf`,
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

export function InventoryPage() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formState, setFormState] = useState({ open: false, item: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search);
  const filters = useMemo(
    () => ({ search: debouncedSearch, page, pageSize }),
    [debouncedSearch, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useInventoryListQuery(filters);
  const { data: binsData } = useBinsQuery({ pageSize: 100 });
  const bins = binsData?.data ?? [];
  const binsById = Object.fromEntries(bins.map((bin) => [bin.id, bin]));
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
    { key: 'sku', header: 'SKU' },
    { key: 'productName', header: 'Product Name' },
    { key: 'warehouse', header: 'Warehouse' },
    { key: 'bin', header: 'Bin', render: (row) => binsById?.[row.binLocationId]?.code ?? '—' },
    { key: 'quantity', header: 'Available' },
    { key: 'reservedQuantity', header: 'Reserved', render: (row) => row.reservedQuantity ?? 0 },
    { key: 'repairQuantity', header: 'In Repair', render: (row) => row.repairQuantity ?? 0 },
    { key: 'total', header: 'Total', render: (row) => totalQuantity(row) },
    { key: 'reorderLevel', header: 'Reorder Level' },
    {
      key: 'stock',
      header: 'Stock',
      render: (row) =>
        row.quantity <= row.reorderLevel ? (
          <BaseBadge variant="danger">Low stock</BaseBadge>
        ) : (
          <BaseBadge variant="success">In stock</BaseBadge>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <AppButton
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              downloadInventoryPdf(row);
            }}
            aria-label={`Download ${row.productName}`}
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
              aria-label={`Edit ${row.productName}`}
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
              aria-label={`Delete ${row.productName}`}
              className="text-danger hover:bg-danger/10"
            >
              <Trash2 className="size-4" />
            </AppButton>
          </Can>
        </div>
      ),
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
            <AppButton onClick={() => setFormState({ open: true, item: null })}>
              <Plus className="size-4" />
              New inventory item
            </AppButton>
          </Can>
        )}
      </div>

      <Tabs tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === 'inventory' && (
        <>
          <FilterBar>
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              placeholder="Search inventory…"
              className="w-72"
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
              <span className="font-medium text-text">{deleteTarget?.productName}</span>? This action cannot be
              undone.
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
