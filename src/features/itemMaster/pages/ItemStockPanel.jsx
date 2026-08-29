import { useState } from 'react';
import { PackageMinus } from 'lucide-react';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useItemStockQuery } from '@/features/itemMaster/queries/useItemStockQuery';
import { useReceiveStock } from '@/features/itemMaster/mutations/useReceiveStock';
import { useConsumeStock } from '@/features/itemMaster/mutations/useConsumeStock';
import { ReceiveStockModal } from '@/features/itemMaster/components/ReceiveStockModal';
import { ConsumeStockModal } from '@/features/itemMaster/components/ConsumeStockModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppSelect } from '@/components/ui/AppSelect';
import { AppButton } from '@/components/ui/AppButton';
import { CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { FilterBar } from '@/components/ui/FilterBar';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function ItemStockPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [warehouseId, setWarehouseId] = useState('');
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [consumeTarget, setConsumeTarget] = useState(null);

  const { data: warehousesData } = useWarehousesQuery({ pageSize: 200 });
  const warehouseOptions = (warehousesData?.data ?? []).map((w) => ({ value: w.id, label: w.name }));

  const { data, isLoading, isFetching, refetch } = useItemStockQuery({
    page,
    pageSize,
    warehouseId: warehouseId || undefined,
  });
  const stockRows = data?.data ?? [];

  const receiveStock = useReceiveStock();
  const consumeStock = useConsumeStock();

  const handleReceiveSubmit = (values) => {
    receiveStock.mutateAsync(values).then(() => setReceiveOpen(false));
  };

  const handleConsumeSubmit = (values) => {
    consumeStock.mutateAsync(values).then(() => setConsumeTarget(null));
  };

  const columns = [
    { key: 'itemCode', header: 'Code' },
    { key: 'itemName', header: 'Item', render: (row) => <span className="font-medium text-text">{row.itemName}</span> },
    { key: 'warehouseName', header: 'Warehouse', render: (row) => row.warehouseName ?? '—' },
    { key: 'uom', header: 'UOM', render: (row) => row.uom || '—' },
    { key: 'quantityOnHand', header: 'On hand', render: (row) => row.quantityOnHand.toLocaleString('en-IN') },
    { key: 'quantityReserved', header: 'Reserved', render: (row) => row.quantityReserved.toLocaleString('en-IN') },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.EDIT}>
            <AppButton
              variant="ghost"
              size="sm"
              title="Consume stock"
              aria-label={`Consume ${row.itemName}`}
              onClick={(e) => { e.stopPropagation(); setConsumeTarget({ warehouseId: row.warehouseId, itemVariantId: row.itemVariantId }); }}
            >
              <PackageMinus className="size-4" />
            </AppButton>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Stock balances for Raw Material, Packaging, Consumables and Spare Parts — Fixed Assets and Services never appear here (see Fixed Asset Register / Finance).</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.ITEM_MASTER} action={ACTIONS.EDIT}>
            <CreateButton onClick={() => setReceiveOpen(true)}>Receive stock</CreateButton>
          </Can>
        </div>
      </div>

      <FilterBar>
        <AppSelect
          value={warehouseId}
          onChange={(event) => { setWarehouseId(event.target.value); setPage(1); }}
          options={warehouseOptions}
          placeholder="All warehouses"
          className="w-56"
          aria-label="Filter by warehouse"
        />
      </FilterBar>

      <AppTable
        columns={columns}
        data={stockRows}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No stock recorded yet"
      />

      <ReceiveStockModal
        open={receiveOpen}
        onClose={() => setReceiveOpen(false)}
        onSubmit={handleReceiveSubmit}
        isSubmitting={receiveStock.isPending}
      />

      <ConsumeStockModal
        open={Boolean(consumeTarget)}
        initialValues={consumeTarget}
        onClose={() => setConsumeTarget(null)}
        onSubmit={handleConsumeSubmit}
        isSubmitting={consumeStock.isPending}
      />
    </div>
  );
}
