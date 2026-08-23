import { useState } from 'react';
import { useItemCategoriesQuery } from '@/features/itemMaster/queries/useItemCategoriesQuery';
import { useFixedAssetsQuery } from '@/features/fixedAssets/queries/useFixedAssetsQuery';
import { useCreateFixedAsset } from '@/features/fixedAssets/mutations/useCreateFixedAsset';
import { FixedAssetFormModal } from '@/features/fixedAssets/components/FixedAssetFormModal';
import { FixedAssetDetailModal } from '@/features/fixedAssets/components/FixedAssetDetailModal';
import { AppTable } from '@/components/ui/AppTable';
import { AppSelect } from '@/components/ui/AppSelect';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CreateButton } from '@/components/ui/ActionButtons';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { FilterBar } from '@/components/ui/FilterBar';
import { Can } from '@/routes/PermissionGuard';
import { MODULES, ACTIONS } from '@/constants/roles';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';

const STATUS_VARIANT = { in_use: 'success', under_maintenance: 'warning', idle: 'default', disposed: 'danger' };

const STATUS_OPTIONS = [
  { value: 'in_use', label: 'In Use' },
  { value: 'under_maintenance', label: 'Under Maintenance' },
  { value: 'idle', label: 'Idle' },
  { value: 'disposed', label: 'Disposed' },
];

function money(value) {
  return value != null ? `₹${Number(value).toLocaleString('en-IN')}` : '—';
}

export function FixedAssetsRegisterPanel() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [status, setStatus] = useState('');
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const { data: categoriesData } = useItemCategoriesQuery({ pageSize: 200 });
  const categoryOptions = (categoriesData?.data ?? []).map((c) => ({ value: c.id, label: c.categoryName }));

  const { data, isLoading, isFetching, refetch } = useFixedAssetsQuery({
    page,
    pageSize,
    status: status || undefined,
    itemCategoryId: itemCategoryId || undefined,
  });
  const assets = data?.data ?? [];
  const createAsset = useCreateFixedAsset();

  const handleSubmit = (values) => {
    createAsset.mutateAsync(values).then(() => setFormOpen(false));
  };

  const columns = [
    { key: 'assetTag', header: 'Tag', render: (row) => row.assetTag ?? '—' },
    { key: 'assetName', header: 'Asset', render: (row) => <span className="font-medium text-text">{row.assetName}</span> },
    { key: 'itemCategoryName', header: 'Category', render: (row) => row.itemCategoryName ?? '—' },
    { key: 'custodianName', header: 'Custodian', render: (row) => row.custodianName ?? '—' },
    { key: 'location', header: 'Location', render: (row) => [row.branchName, row.warehouseName, row.locationNote].filter(Boolean).join(' — ') || '—' },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} variantMap={STATUS_VARIANT} /> },
    { key: 'netBookValue', header: 'Net book value', render: (row) => money(row.netBookValue) },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Machinery, computers, furniture, vehicles and tools the company owns and uses internally — individually tracked, never aggregated as stock.</p>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refetch} isFetching={isFetching} />
          <Can module={MODULES.FIXED_ASSETS} action={ACTIONS.CREATE}>
            <CreateButton onClick={() => setFormOpen(true)}>Register asset</CreateButton>
          </Can>
        </div>
      </div>

      <FilterBar>
        <AppSelect
          value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          options={STATUS_OPTIONS}
          placeholder="All statuses"
          className="w-48"
          aria-label="Filter by status"
        />
        <AppSelect
          value={itemCategoryId}
          onChange={(event) => { setItemCategoryId(event.target.value); setPage(1); }}
          options={categoryOptions}
          placeholder="All categories"
          className="w-56"
          aria-label="Filter by category"
        />
      </FilterBar>

      <AppTable
        columns={columns}
        data={assets}
        total={data?.total ?? 0}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        onRowClick={(asset) => setSelectedAssetId(asset.id)}
        emptyMessage="No assets registered yet"
      />

      <FixedAssetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={createAsset.isPending}
      />

      {selectedAssetId && <FixedAssetDetailModal assetId={selectedAssetId} onClose={() => setSelectedAssetId(null)} />}
    </div>
  );
}
