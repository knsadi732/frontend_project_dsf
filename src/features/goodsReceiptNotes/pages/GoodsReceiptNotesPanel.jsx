import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGoodsReceiptNotesQuery } from '@/features/goodsReceiptNotes/queries/useGoodsReceiptNotesQuery';
import { usePurchasesQuery } from '@/features/purchases/queries/usePurchasesQuery';
import { useWarehousesQuery } from '@/features/warehouses/queries/useWarehousesQuery';
import { useVendorsQuery } from '@/features/vendors/queries/useVendorsQuery';
import { goodsReceiptNoteApi } from '@/features/goodsReceiptNotes/api';
import { SearchInput } from '@/components/ui/SearchInput';
import { FilterBar } from '@/components/ui/FilterBar';
import { MultiFilter } from '@/components/ui/MultiFilter';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { AppTable } from '@/components/ui/AppTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UploadButton, ViewButton } from '@/components/ui/ActionButtons';
import { useDebounce } from '@/hooks/useDebounce';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { queryKeys } from '@/config/queryKeys';
import { pushToast } from '@/utils/toastBus';

const GRN_STATUS_VARIANT = { draft: 'default', inspected: 'warning', completed: 'success', rejected: 'danger' };

// Only these are accepted server-side (anything else 422s with GRN_002) —
// checked client-side too so a wrong file type fails fast with a clear
// message instead of a round-trip.
const ACCEPTED_INVOICE_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function VendorInvoiceCell({ row }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handleFileSelected = (file) => {
    if (!ACCEPTED_INVOICE_TYPES.includes(file.type)) {
      pushToast('error', 'Only PDF, JPEG, or PNG files are accepted for a vendor invoice');
      return;
    }
    setUploading(true);
    goodsReceiptNoteApi
      .uploadInvoice({ grnNumber: row.grnNumber, file })
      .then(() => {
        pushToast('success', 'Vendor invoice uploaded');
        queryClient.invalidateQueries({ queryKey: queryKeys.goodsReceiptNotes.all });
      })
      .catch(() => pushToast('error', 'Failed to upload vendor invoice'))
      .finally(() => setUploading(false));
  };

  return (
    <div className="flex items-center gap-3">
      {row.vendorInvoiceNumber && <span className="text-text-muted">{row.vendorInvoiceNumber}</span>}
      {row.vendorInvoiceUrl ? (
        <ViewButton label="View uploaded invoice" href={row.vendorInvoiceUrl} />
      ) : (
        <UploadButton
          label="Upload vendor invoice"
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploading}
          onFileSelected={handleFileSelected}
        />
      )}
    </div>
  );
}

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

  const columns = [
    { key: 'grnNumber', header: 'GRN Number' },
    { key: 'po', header: 'Purchase Order', render: (row) => purchaseOrdersById?.[row.purchaseOrderId]?.poNumber ?? '—' },
    { key: 'warehouse', header: 'Warehouse', render: (row) => warehousesById?.[row.warehouseId]?.name ?? '—' },
    { key: 'vendorInvoiceNumber', header: 'Vendor Invoice', render: (row) => <VendorInvoiceCell row={row} /> },
    { key: 'receivedDate', header: 'Received Date', render: (row) => (row.receivedDate ? String(row.receivedDate).slice(0, 10) : '—') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={GRN_STATUS_VARIANT} /> },
  ];

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
        emptyMessage="No goods receipt notes yet"
      />
    </div>
  );
}
