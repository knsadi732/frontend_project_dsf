import { useState } from 'react';
import { useItemsQuery } from '@/features/itemMaster/queries/useItemsQuery';
import { useItemStockMovementsQuery } from '@/features/itemMaster/queries/useItemStockMovementsQuery';
import { AppTable } from '@/components/ui/AppTable';
import { AppSelect } from '@/components/ui/AppSelect';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { FilterBar } from '@/components/ui/FilterBar';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const MOVEMENT_TYPE_VARIANT = { receipt: 'success', consumption: 'warning', adjustment: 'info' };

// Read-only stock ledger — rows are written internally by the receive/
// consume actions (item.service.js), never created directly here.
export function ItemStockMovementsPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [itemId, setItemId] = useState('');

  const { data: itemsData } = useItemsQuery({ pageSize: 500 });
  const itemOptions = (itemsData?.data ?? []).map((item) => ({ value: item.id, label: `${item.itemCode} — ${item.itemName}` }));

  const { data, isLoading, isFetching, refetch } = useItemStockMovementsQuery({
    page,
    pageSize,
    itemId: itemId || undefined,
  });
  const movements = data?.data ?? [];

  const columns = [
    { key: 'createdAt', header: 'Date', render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString('en-IN') : '—') },
    { key: 'itemName', header: 'Item', render: (row) => <span className="font-medium text-text">{row.itemCode} — {row.itemName}</span> },
    { key: 'warehouseName', header: 'Warehouse', render: (row) => row.warehouseName ?? '—' },
    { key: 'movementType', header: 'Type', render: (row) => <StatusBadge status={row.movementType} variantMap={MOVEMENT_TYPE_VARIANT} /> },
    { key: 'quantityChange', header: 'Qty change', render: (row) => (row.quantityChange > 0 ? `+${row.quantityChange}` : row.quantityChange) },
    { key: 'quantityOnHandAfter', header: 'On hand after', render: (row) => row.quantityOnHandAfter ?? '—' },
    { key: 'referenceType', header: 'Reference', render: (row) => row.referenceType || '—' },
    { key: 'remarks', header: 'Remarks', render: (row) => row.remarks || '—' },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Full audit trail of every receipt, consumption and adjustment against Item stock.</p>
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </div>

      <FilterBar>
        <AppSelect
          value={itemId}
          onChange={(event) => { setItemId(event.target.value); setPage(1); }}
          options={itemOptions}
          placeholder="All items"
          className="w-64"
          aria-label="Filter by item"
        />
      </FilterBar>

      <AppTable
        columns={columns}
        data={movements}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No stock movements yet"
      />
    </div>
  );
}
