import { useMemo, useState } from 'react';
import { useGoodsReceiptNotesQuery } from '@/features/goodsReceiptNotes/queries/useGoodsReceiptNotesQuery';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { GrnTable } from '@/features/goodsReceiptNotes/components/GrnTable';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

export function GoodsReceiptNotesPanel() {
  const [search, setSearch] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedSearch = useDebounce(search);
  // Real GET /grn query params: page, limit, sortBy, sortOrder, search,
  // vendorId, warehouseId — no `status` filter.
  const filters = useMemo(
    () => ({ search: debouncedSearch, vendorId, warehouseId, page, pageSize }),
    [debouncedSearch, vendorId, warehouseId, page, pageSize],
  );

  const { data, isLoading, isFetching, refetch } = useGoodsReceiptNotesQuery(filters);
  const { data: purchasesData } = usePurchasesQuery({ pageSize: 100 });
  const { data: warehousesData } = useWarehousesQuery({ pageSize: 100 });
  const { data: vendorsData } = useVendorsQuery({ pageSize: 100 });
  const purchaseOrdersById = Object.fromEntries((purchasesData?.data ?? []).map((po) => [po.id, po]));
  const warehouses = warehousesData?.data ?? [];
  const warehousesById = Object.fromEntries(warehouses.map((w) => [w.id, w]));
  const vendors = vendorsData?.data ?? [];
  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));
  const vendorOptions = vendors.map((v) => ({ value: v.id, label: v.name }));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-text-muted">Goods receipt notes (read-only for now).</p>

      <FilterBar>
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search GRNs…"
          className="w-72"
        />
        <MultiFilter
          filters={[
            { key: 'vendorId', label: 'Vendor', options: vendorOptions, placeholder: 'All vendors' },
            { key: 'warehouseId', label: 'Warehouse', options: warehouseOptions, placeholder: 'All warehouses' },
          ]}
          values={{ vendorId, warehouseId }}
          onChange={(key, value) => {
            if (key === 'vendorId') setVendorId(value);
            if (key === 'warehouseId') setWarehouseId(value);
            setPage(1);
          }}
          onClear={() => {
            setVendorId('');
            setWarehouseId('');
            setPage(1);
          }}
        />
        <RefreshButton onClick={refetch} isFetching={isFetching} />
      </FilterBar>

      <GrnTable
        grns={data?.data ?? []}
        purchaseOrdersById={purchaseOrdersById}
        warehousesById={warehousesById}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
}
